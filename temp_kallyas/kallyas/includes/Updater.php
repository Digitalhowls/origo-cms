<?php

namespace Kallyas;

use Kallyas\Kallyas;
use Kallyas\License;

if ( ! defined( 'ABSPATH' ) ) {
	return;
}

class Updater {
	/**
	 * The server API
	 */
	private $server_api;

	/**
	 * Constructor
	 *
	 * @param ServerAPI $server_api The server API
	 */
	public function __construct( $server_api ) {
		$this->server_api = $server_api;
		add_filter( 'pre_set_site_transient_update_themes', array( $this, 'check_for_updates' ) );
	}

	/** Will check if we have an update
	 *
	 * @var array $transient The update transient
	 */
	public function check_for_updates( $update_transient ) {
		// make a request to retrieve the version.json file
		$new_version_info = $this->server_api->get_update_version_info();

		if ( is_wp_error( $new_version_info ) || null === $new_version_info ) {
			return $update_transient;
		}

		// If we have an update
		if ( version_compare( Kallyas::get_instance()->get_version(), $new_version_info['version'], '<' ) ) {
			// Don't proceed if we do not have a valid license key
			if ( ! License::get_license_key() ) {
				return $update_transient;
			}

			// Make the request to retrieve the download URL
			$update_transient->response[ Kallyas::get_instance()->get_theme_id() ] = array(
				'theme'        => Kallyas::get_instance()->get_theme_id(),
				'new_version'  => $new_version_info['version'],
				'url'          => '',
				'package'      => $this->server_api->get_theme_download_url( $new_version_info['version'] ),
				'requires'     => '',
				'requires_php' => '',
			);
		} else {
			// No update is available.
			$item = array(
				'theme'        => Kallyas::get_instance()->get_theme_id(),
				'new_version'  => Kallyas::get_instance()->get_version(),
				'url'          => '',
				'package'      => '',
				'requires'     => '',
				'requires_php' => '',
			);
			// Adding the "mock" item to the `no_update` property is required
			// for the enable/disable auto-updates links to correctly appear in UI.
			$update_transient->no_update[ Kallyas::get_instance()->get_theme_id() ] = $item;
		}

		return $update_transient;
	}
}
