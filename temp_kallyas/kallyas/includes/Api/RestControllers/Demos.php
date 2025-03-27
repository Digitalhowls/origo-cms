<?php

namespace Kallyas\Api\RestControllers;

use Kallyas\Api\RestApiController;
use Kallyas\Kallyas;
use WP_Error;

// Prevent direct access
if ( ! defined( 'ABSPATH' ) ) {
	return;
}

/**
 * Class Assets
 */
class Demos extends RestApiController {

	/**
	 * Api endpoint
	 *
	 * @var string
	 */
	protected $base = 'demos';

	/**
	 * Register routes
	 *
	 * @return void
	 */
	public function register_routes() {
		register_rest_route(
			$this->namespace,
			'/' . $this->base . '/activate',
			[
				[
					'methods'             => \WP_REST_Server::CREATABLE,
					'callback'            => [ $this, 'install' ],
					'args'                => [
						'slug' => [
							'type' => 'string',
						],
					],
					'permission_callback' => [ $this, 'get_item_permissions_check' ],
				],
			]
		);

		register_rest_route(
			$this->namespace,
			'/' . $this->base . '/update-list',
			[
				[
					'methods'             => \WP_REST_Server::READABLE,
					'callback'            => [ $this, 'update_demo_list' ],
					'permission_callback' => [ $this, 'get_item_permissions_check' ],
				],
			]
		);
	}

	/**
	 * This function will register the API key to the theme
	 *
	 * @param \WP_REST_Request $request
	 * @since 4.20.0
	 *
	 * @return array|\WP_Error
	 */
	public function update_demo_list() {
		$response = Kallyas::get_instance()->server_api->get_demos_list();

		if ( is_wp_error( $response ) ) {
			$response->add_data( [ 'status' => 400 ] );
			return $response;
		} else {
			return rest_ensure_response( $response );
		}
	}
}
