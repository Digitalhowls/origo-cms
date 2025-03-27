<?php

/**
 * Create an empty object if the ZN framework/ function is not available
 */
if ( ! function_exists( 'ZN' ) ) {
	function ZN() {
		return new stdClass();
	}
}

// Define constants
define( 'ZN_FW_VERSION', ZNHGTFW()->getVersion() );
define( 'THEME_BASE', get_template_directory() );
define( 'CHILD_BASE', get_stylesheet_directory() );
define( 'THEME_BASE_URI', esc_url( get_template_directory_uri() ) );
define( 'CHILD_BASE_URI', esc_url( get_stylesheet_directory_uri() ) );

// Set object vars
ZN()->version = ZN_FW_VERSION;

// Register theme pages
add_filter( 'znhgtfw_use_register_admin_pages', '__return_false' );
add_action( 'znhgtfw_register_admin_pages', 'znkl_register_theme_pages', 10, 2 );

/**
 * Will register all theme's pages
 * This is required because the TFW adds thee options under the Appearance menu
 *
 * @param $tfwAdmin
 * @param $icon
 */
function znkl_register_theme_pages( $tfwAdmin, $icon ) {
	// Add all sub-pages
	foreach ( $tfwAdmin->data['theme_pages'] as $key => $value ) {

		/* CREATE THE SUB-PAGES */
		$tfwAdmin->theme_pages[] = add_submenu_page(
			'kallyas-dashboard',
			$value['title'],
			$value['title'],
			'manage_options',
			'zn_tp_' . $key,
			array( $tfwAdmin, 'zn_render_page' )
		);
	}
}

add_action( 'znb:elements:init', 'hg_ZionBuilderElementsInit', 25 );
/**
 * @param ZionElementsManager $instance
 */
function hg_ZionBuilderElementsInit( $instance ) {
	$instance->unregisterElement( 'HgMcNewsletter' );
}
