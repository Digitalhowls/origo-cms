<?php

namespace Kallyas\Integrations;

// Prevent direct access
if ( ! defined( 'ABSPATH' ) ) {
	return;
}

/**
 * Class Gutenberg
 *
 * @package Kallyas\Integrations
 */
class WPML implements IBaseIntegration {
	/**
	 * Retrieve the name of the integration
	 *
	 * @return string
	 */
	public static function get_name() {
		return 'wpml';
	}


	/**
	 * Check if we can load this integration or not
	 *
	 * @return boolean If true, the integration will be loaded
	 */
	public static function can_load() {
		return defined( 'ICL_SITEPRESS_VERSION' );
	}


	/**
	 * Main class constructor
	 */
	public function __construct() {
		add_filter( 'kallyas/mega_menu/smart_area/post_id', [ $this, 'change_post_id' ], 10 );
	}

	/**
	 * Sets the proper post id for polylang translated pages
	 *
	 * @param string $post_id The preview content
	 *
	 * @return string The preview content
	 */
	public function change_post_id( $post_id ) {
		$post_type       = get_post_type( $post_id );
		$translated_post = apply_filters( 'wpml_object_id', $post_id, $post_type );

		if ( $translated_post ) {
			$post_id = $translated_post;
		}

		return $post_id;
	}
}
