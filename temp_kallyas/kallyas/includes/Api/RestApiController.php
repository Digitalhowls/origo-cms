<?php

namespace Kallyas\Api;

// Prevent direct access
if ( ! defined( 'ABSPATH' ) ) {
	return;
}

/**
 * Class RestApiController
 *
 * @package ZionBuilder\Api
 */
class RestApiController extends \WP_REST_Controller {
	protected $namespace = 'kallyas/v1';
	protected $base      = '';

	public function get_controller_id() {
		return $this->namespace . '/' . $this->base;
	}

	/**
	 * Initialize the class' default functionality
	 */
	public function init() {
		$this->register_routes();
	}

	/**
	 * Register routes
	 */
	public function register_routes() {
	}

	// Sets up the proper HTTP status code for authorization.
	public function authorization_status_code() {
		$status = 401;

		if ( is_user_logged_in() ) {
			$status = 403;
		}

		return $status;
	}

	/**
	 * Checks if a given request has access to regenerate cache
	 *
	 * @since 1.0.0
	 *
	 * @param \WP_REST_Request $request full details about the request
	 *
	 * @return \WP_Error|bool true if the request has read access for the item, WP_Error object otherwise
	 */
	public function get_item_permissions_check( $request ) {
		return current_user_can( 'manage_options' );
	}
}
