<?php

add_action( 'after_setup_theme', 'znwoo_enable_woo_features' );
function znwoo_enable_woo_features(){

	if( zget_option('zn_woo_enable_zoom', 'zn_woocommerce_options', false, 'no') == 'yes' ) {
		add_theme_support('wc-product-gallery-zoom');
	}

	if( zget_option('zn_woo_enable_slider', 'zn_woocommerce_options', false, 'no') == 'yes' ){
		add_theme_support( 'wc-product-gallery-slider' );
	}

	// Allow us to zoomm into images
	add_theme_support( 'wc-product-gallery-lightbox' );

}

add_action( 'wp_enqueue_scripts', 'zn_add_woo_cart_fragments' );
function zn_add_woo_cart_fragments() {
	$show_cart_to_visitors = zget_option( 'show_cart_to_visitors', 'zn_woocommerce_options', false, 'yes' );
	if ($show_cart_to_visitors === 'yes') {
		wp_enqueue_script( 'wc-cart-fragments' );
	}
}