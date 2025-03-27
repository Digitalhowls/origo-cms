<?php

namespace Kallyas\Api\RestControllers;

use Kallyas\Api\RestApiController;
use Kallyas\License;
use WP_Error;

// Prevent direct access
if ( ! defined( 'ABSPATH' ) ) {
	return;
}

/**
 * Class Assets
 */
class Theme extends RestApiController {

	/**
	 * Api endpoint
	 *
	 * @var string
	 */
	protected $base = 'theme';

	/**
	 * Register routes
	 *
	 * @return void
	 */
	public function register_routes() {
		register_rest_route(
			$this->namespace,
			'/' . $this->base . '/register',
			[
				[
					'methods'             => \WP_REST_Server::CREATABLE,
					'callback'            => [ $this, 'register_theme' ],
					'args'                => [
						'api_key' => [
							'description' => __( 'The api key you want to register.', 'kallyas' ),
							'type'        => 'string',
						],
					],
					'permission_callback' => [ $this, 'get_item_permissions_check' ],
				],
			]
		);

		register_rest_route(
			$this->namespace,
			'/' . $this->base . '/unregister',
			[
				[
					'methods'             => \WP_REST_Server::READABLE,
					'callback'            => [ $this, 'unregister' ],
					'args'                => [
						'api_key' => [
							'description' => __( 'The api key you want to register.', 'kallyas' ),
							'type'        => 'string',
						],
					],
					'permission_callback' => [ $this, 'get_item_permissions_check' ],
				],
			]
		);
	}


	/**
	 * This function will register the API key to the theme
	 *
	 * @param \WP_REST_Request $request
	 * @since 3.4.0
	 *
	 * @return array|\WP_Error
	 */
	public function register_theme( $request ) {
		$api_key  = $request->get_param( 'api_key' );
		$response = kallyas()->server_api->register_theme( $api_key );

		if ( is_wp_error( $response ) ) {
			$response->add_data( [ 'status' => 400 ] );
			return $response;
		} else {
			License::register_license( $api_key );
			return rest_ensure_response( $response );
		}
	}


	/**
	 * This function will register the API key to the theme
	 *
	 * @param \WP_REST_Request $request
	 * @since 3.4.0
	 *
	 * @return array|\WP_Error
	 */
	public function unregister( $request ) {
		$response = kallyas()->server_api->unregister_theme();

		if ( is_wp_error( $response ) ) {
			$response->add_data( [ 'status' => 400 ] );
			return $response;
		} else {
			License::unregister_license();
			return rest_ensure_response( $response );
		}
	}
}
