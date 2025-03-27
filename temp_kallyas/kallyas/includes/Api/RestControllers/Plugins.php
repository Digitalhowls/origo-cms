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
class Plugins extends RestApiController {

	/**
	 * Api endpoint
	 *
	 * @var string
	 */
	protected $base = 'plugins';

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
					'callback'            => [ $this, 'activate' ],
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
			'/' . $this->base . '/deactivate',
			[
				[
					'methods'             => \WP_REST_Server::CREATABLE,
					'callback'            => [ $this, 'deactivate' ],
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
			'/' . $this->base . '/install',
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
			'/' . $this->base . '/update',
			[
				[
					'methods'             => \WP_REST_Server::CREATABLE,
					'callback'            => [ $this, 'update_plugin' ],
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
					'callback'            => [ $this, 'update_plugins_list' ],
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
	public function activate( $request ) {
		$slug     = $request->get_param( 'slug' );
		$response = kallyas()->plugins->activate_plugin_by_slug( $slug );

		if ( is_wp_error( $response ) ) {
			$response->add_data( [ 'status' => 400 ] );
			return $response;
		} else {
			return rest_ensure_response( kallyas()->plugins->get_single_plugin_data( $slug ) );
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
	public function deactivate( $request ) {
		$slug     = $request->get_param( 'slug' );
		$response = kallyas()->plugins->deactivate_plugin_by_slug( $slug );

		if ( is_wp_error( $response ) ) {
			$response->add_data( [ 'status' => 400 ] );
			return $response;
		} else {
			return rest_ensure_response( kallyas()->plugins->get_single_plugin_data( $slug ) );
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
	public function update_plugin( $request ) {
		$slug     = $request->get_param( 'slug' );
		$response = kallyas()->plugins->update_plugin( $slug );

		if ( is_wp_error( $response ) ) {
			$response->add_data( [ 'status' => 400 ] );
			return $response;
		} else {
			return rest_ensure_response( kallyas()->plugins->get_single_plugin_data( $slug ) );
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
	public function install( $request ) {
		$slug     = $request->get_param( 'slug' );
		$response = kallyas()->plugins->install_addon( $slug );

		if ( is_wp_error( $response ) ) {
			$response->add_data( [ 'status' => 400 ] );
			return $response;
		} else {
			return rest_ensure_response( kallyas()->plugins->get_single_plugin_data( $slug ) );
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
	public function update_plugins_list() {
		$response = Kallyas::get_instance()->server_api->get_plugins_list();

		if ( is_wp_error( $response ) ) {
			$response->add_data( [ 'status' => 400 ] );
			return $response;
		} else {
			return rest_ensure_response( Kallyas::get_instance()->plugins->get_plugins_list_for_dashboard() );
		}
	}
}
