<?php
/**
 * Plugin Name: VargaMesh Pay for WooCommerce
 * Description: Non-custodial manual VMESH payment gateway using the VargaMesh Pay URI standard.
 * Version: 0.1.0
 * Author: Varga-Tech
 * License: MIT
 */

if (!defined('ABSPATH')) exit;

add_action('plugins_loaded', function () {
    if (!class_exists('WC_Payment_Gateway')) return;

    class WC_Gateway_VargaMesh_Pay extends WC_Payment_Gateway {
        public function __construct() {
            $this->id = 'vargamesh_pay';
            $this->method_title = 'VargaMesh Pay';
            $this->method_description = 'Accept manual self-custody VMESH payments.';
            $this->has_fields = false;
            $this->supports = array('products');

            $this->init_form_fields();
            $this->init_settings();

            $this->title = $this->get_option('title');
            $this->description = $this->get_option('description');
            $this->address = trim($this->get_option('address'));

            add_action('woocommerce_update_options_payment_gateways_' . $this->id, array($this, 'process_admin_options'));
            add_action('woocommerce_thankyou_' . $this->id, array($this, 'thankyou_page'));
        }

        public function init_form_fields() {
            $this->form_fields = array(
                'enabled' => array('title' => 'Enable', 'type' => 'checkbox', 'label' => 'Enable VargaMesh Pay', 'default' => 'no'),
                'title' => array('title' => 'Title', 'type' => 'text', 'default' => 'VargaMesh (VMESH)'),
                'description' => array('title' => 'Description', 'type' => 'textarea', 'default' => 'Pay with VMESH. Your order will remain on hold until the payment is verified.'),
                'address' => array('title' => 'Receiving VMESH address', 'type' => 'text', 'description' => 'Public receiving address only. Never enter a private key or WIF here.')
            );
        }

        public function validate_fields() {
            if (!preg_match('/^vm1[0-9ac-hj-np-z]{20,100}$/i', $this->address)) {
                wc_add_notice('The shop has no valid VMESH receiving address configured.', 'error');
                return false;
            }
            return true;
        }

        public function process_payment($order_id) {
            $order = wc_get_order($order_id);
            $order->update_status('on-hold', 'Awaiting VMESH payment.');
            wc_reduce_stock_levels($order_id);
            WC()->cart->empty_cart();
            return array('result' => 'success', 'redirect' => $this->get_return_url($order));
        }

        private function payment_uri($order) {
            // WooCommerce store currency conversion is outside v0.1 scope.
            // The order total is treated as VMESH only when the shop itself prices in VMESH.
            $amount = wc_format_decimal($order->get_total(), 8);
            $params = array(
                'amount' => $amount,
                'label' => get_bloginfo('name'),
                'message' => 'Order ' . $order->get_order_number(),
                'reference' => 'WC-' . $order->get_id()
            );
            return 'vargamesh:' . rawurlencode($this->address) . '?' . http_build_query($params, '', '&', PHP_QUERY_RFC3986);
        }

        public function thankyou_page($order_id) {
            $order = wc_get_order($order_id);
            if (!$order) return;
            $uri = $this->payment_uri($order);
            echo '<h2>' . esc_html__('VargaMesh payment', 'vargamesh-pay') . '</h2>';
            echo '<p>' . esc_html__('Send the exact VMESH amount shown below. The order remains on hold until payment is verified.', 'vargamesh-pay') . '</p>';
            echo '<p><strong>' . esc_html(wc_format_decimal($order->get_total(), 8)) . ' VMESH</strong></p>';
            echo '<p><code style="word-break:break-all">' . esc_html($this->address) . '</code></p>';
            echo '<p><a class="button" href="' . esc_attr($uri) . '">' . esc_html__('Open VargaMesh wallet', 'vargamesh-pay') . '</a></p>';
            echo '<p><small><code style="word-break:break-all">' . esc_html($uri) . '</code></small></p>';
        }
    }

    add_filter('woocommerce_payment_gateways', function ($gateways) {
        $gateways[] = 'WC_Gateway_VargaMesh_Pay';
        return $gateways;
    });
});
