<?php

namespace Kallyas;

use Kallyas\Demos;

if ( ! defined( 'ABSPATH' ) ) {
	return;
}

class Dashboard {
	const DASHBOARD_PAGE_ID = 'kallyas-dashboard';
	const MANAGE_CAP        = 'manage_options';

	public function __construct() {
		add_action( 'admin_menu', array( $this, 'add_dashboard_page' ) );
		add_action( 'after_switch_theme', array( $this, 'redirect_to_dashboard' ) );

		// Enqueue scripts
		add_action( 'admin_enqueue_scripts', [ $this, 'enqueue_scripts' ], 11 );
	}

	public function redirect_to_dashboard() {
		global $pagenow;

		// Redirect the user to the Theme Dashboard
		if ( is_admin() && 'themes.php' === $pagenow && isset( $_GET['activated'] ) ) {
			wp_safe_redirect( add_query_arg( [ 'page' => self::DASHBOARD_PAGE_ID ], admin_url( 'admin.php' ) ) );
			exit();
		}
	}

	public function add_dashboard_page() {
		$icon = 'data:image/svg+xml;base64, PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+PHN2ZyB3aWR0aD0iNzhweCIgaGVpZ2h0PSI3OHB4IiB2aWV3Qm94PSIwIDAgNzggNzgiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeG1sbnM6c2tldGNoPSJodHRwOi8vd3d3LmJvaGVtaWFuY29kaW5nLmNvbS9za2V0Y2gvbnMiPiAgICAgICAgPHRpdGxlPmthbGx5YXNfbG9nbzwvdGl0bGU+ICAgIDxkZXNjPkNyZWF0ZWQgd2l0aCBTa2V0Y2guPC9kZXNjPiAgICA8ZGVmcz4gICAgICAgIDxsaW5lYXJHcmFkaWVudCB4MT0iNTAlIiB5MT0iMCUiIHgyPSI1MCUiIHkyPSI5Ny4wODAyNzc0JSIgaWQ9ImxpbmVhckdyYWRpZW50LTEiPiAgICAgICAgICAgIDxzdG9wIHN0b3AtY29sb3I9IiMzQzNDM0MiIG9mZnNldD0iMCUiPjwvc3RvcD4gICAgICAgICAgICA8c3RvcCBzdG9wLWNvbG9yPSIjODQyRTJGIiBvZmZzZXQ9IjQ5LjQ5NjY3NjUlIj48L3N0b3A+ICAgICAgICAgICAgPHN0b3Agc3RvcC1jb2xvcj0iI0NEMjEyMiIgb2Zmc2V0PSIxMDAlIj48L3N0b3A+ICAgICAgICA8L2xpbmVhckdyYWRpZW50PiAgICA8L2RlZnM+ICAgIDxnIGlkPSJQYWdlLTEiIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSIjOTk5IiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIHNrZXRjaDp0eXBlPSJNU1BhZ2UiPiAgICAgICAgPGcgaWQ9ImthbGx5YXNfbG9nbyIgc2tldGNoOnR5cGU9Ik1TQXJ0Ym9hcmRHcm91cCIgZmlsbD0iIzk5OSI+ICAgICAgICAgICAgPHBhdGggZD0iTTM5LDc2IEMxOC41NjYsNzYgMiw1OS40MzUgMiwzOSBDMiwxOC41NjUgMTguNTY2LDIgMzksMiBDNTkuNDM1LDIgNzYsMTguNTY1IDc2LDM5IEM3Niw1OS40MzUgNTkuNDM1LDc2IDM5LDc2IEwzOSw3NiBaIE02Ni43NSwzOSBDNjYuNzUsMzUuODQxIDY2LjE5NywzMi44MTcgNjUuMjI0LDI5Ljk4NyBMNTQuMjQ1LDQxLjk3NCBDNTMuNjY5LDQyLjYxNyA1My4wMzUsNDMuMTg2IDUyLjM0NCw0My42OCBDNTEuNjUyLDQ0LjE3NSA1MC45MzIsNDQuNjA3IDUwLjE4Myw0NC45NzggQzUwLjc4OCw0NS4zOTkgNTEuMzEzLDQ1Ljg4NyA1MS43Niw0Ni40NDMgQzUyLjIwNyw0Ni45OTkgNTIuNjAzLDQ3LjYzNiA1Mi45NDksNDguMzUzIEw1OC4xNjksNTkuMDM0IEM2My40NDcsNTMuOTgyIDY2Ljc1LDQ2Ljg4MyA2Ni43NSwzOSBMNjYuNzUsMzkgWiBNNDYuOTYxLDY1LjU3NyBDNDYuNzc2LDY1LjM1NyA0Ni42MDcsNjUuMTExIDQ2LjQ2Niw2NC44MTkgTDQwLjI0Miw1MS4yMDggQzM5LjkyNSw1MC41OTEgMzkuNTg3LDUwLjE4OSAzOS4yMjcsNTAuMDAzIEMzOC44NjYsNDkuODE4IDM4LjI4Myw0OS43MjUgMzcuNDc2LDQ5LjcyNSBMMzYuMDkzLDQ5LjcyNSBMMzMuNzQ2LDY2LjIzOCBDMzUuNDQ4LDY2LjU2NSAzNy4yMDIsNjYuNzUgMzksNjYuNzUgQzQxLjc2OSw2Ni43NSA0NC40MzgsNjYuMzMyIDQ2Ljk2MSw2NS41NzcgTDQ2Ljk2MSw2NS41NzcgWiBNMTEuMjUsMzkgQzExLjI1LDQ3LjYyNCAxNS4xODQsNTUuMzI4IDIxLjM1NSw2MC40MTggTDI4LjA3NywxMy40ODkgQzE4LjE4MywxNy43MzEgMTEuMjUsMjcuNTU0IDExLjI1LDM5IEwxMS4yNSwzOSBaIE00MS42MDQsMTEuMzgyIEwzNy4xNzQsNDIuMzQ1IEwzOC4wODEsNDIuMzQ1IEMzOC44Myw0Mi4zNDUgMzkuNDM1LDQyLjI0NiAzOS44OTcsNDIuMDQ4IEM0MC4zNTcsNDEuODUxIDQwLjgxOCw0MS40OTIgNDEuMjgsNDAuOTczIEw1MC41MjksMzAuMTQ0IEM1MS4wNzYsMjkuNTAxIDUxLjY4MSwyOS4wMzEgNTIuMzQ0LDI4LjczNSBDNTMuMDA2LDI4LjQzOCA1My44MTMsMjguMjg5IDU0Ljc2NCwyOC4yODkgTDY0LjYwMywyOC4yODkgQzYwLjczMSwxOS4wNDUgNTIsMTIuMzUgNDEuNjA0LDExLjM4MiBMNDEuNjA0LDExLjM4MiBaIiBpZD0iU2hhcGUiIHNrZXRjaDp0eXBlPSJNU1NoYXBlR3JvdXAiPjwvcGF0aD4gICAgICAgIDwvZz4gICAgPC9nPjwvc3ZnPg == ';

		add_menu_page(
			__( 'Kallyas Theme', 'kallyas' ),
			__( 'Kallyas Theme', 'kallyas' ),
			self::MANAGE_CAP,
			self::DASHBOARD_PAGE_ID,
			array( $this, 'admin_dashboard_page' ),
			$icon
		);

		add_submenu_page(
			self::DASHBOARD_PAGE_ID,
			esc_html__( 'Dashboard', 'kallyas' ),
			esc_html__( 'Dashboard', 'kallyas' ),
			self::MANAGE_CAP,
			self::DASHBOARD_PAGE_ID,
			[ $this, 'admin_dashboard_page' ]
		);

		do_action( 'kallyas/dashboard/admin_menu', $this );
	}

	public function enqueue_scripts( $hook ) {
		$admin_hook = sprintf( 'toplevel_page_kallyas-dashboard' );

		if ( $admin_hook === $hook ) {
			do_action( 'kallyas/dashboard/before_admin_scripts' );

			// Load Dashboard page styles
			Kallyas::get_instance()->scripts->enqueue_style(
				'kallyas-dashboard',
				'dashboard',
				[],
				Kallyas::get_instance()->get_version()
			);

			// Load Dashboard page script
			Kallyas::get_instance()->scripts->enqueue_script(
				'kallyas-dashboard',
				'dashboard',
				[
					'wp-i18n',
				],
				Kallyas::get_instance()->get_version(),
				true
			);

			wp_localize_script(
				'kallyas-dashboard',
				'kallyas_dashboard_vars',
				[
					'theme_name'    => Kallyas::get_instance()->get_theme_info()->get( 'Name' ),
					'theme_version' => Kallyas::get_instance()->get_theme_info()->get( 'Version' ),
					'license_key'   => License::get_license_key(),
					'rest'          => [
						'root'              => esc_url_raw( rest_url() ),
						'nonce'             => wp_create_nonce( 'wp_rest' ),
						'ajaxurl'           => admin_url( 'admin-ajax.php' ),
						'demo_import_nonce' => wp_create_nonce( 'ZN_DEMO_IMPORT' ),
					],
					'plugins_list'  => Kallyas::get_instance()->plugins->get_plugins_list_for_dashboard(),
					'demos_list'    => Demos::get_demos_list(),

				]
			);

			do_action( 'kallyas/dashboard/after_admin_scripts' );

		}
	}

	public function admin_dashboard_page() {
		?>
		<div id="kallyas-dashboard"></div>
		<?php
	}
}
