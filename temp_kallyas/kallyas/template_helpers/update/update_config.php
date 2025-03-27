<?php

if ( ! defined( 'THEME_BASE' ) ) {
	exit( 'Invalid Request' );
}

add_filter( 'zn_theme_update_scripts', 'zn_kallyas_updater_scripts' );
add_filter( 'zn_theme_normal_update_scripts', 'zn_kallyas_normal_updates_scripts' );

/**
 *  Updates that requires DB updates ( Normally it should only be the V3 to V4 update )
 */
function zn_kallyas_updater_scripts() {
	$updates = array(
		'4.0.0' => array(
			'file'     => THEME_BASE . '/template_helpers/update/scripts/kallyas-update-4.0.0.php',
			'function' => 'zn_cnv_perform_updatev4',
		),
	);

	return $updates;
}

function zn_kallyas_normal_updates_scripts() {
	$updates = array(
		'4.0.5'  => array(
			'function' => 'zn_update_405',
		),
		'4.0.9'  => array(
			'function' => 'zn_update_409',
		),
		'4.0.12' => array(
			'function' => 'zn_update_4012',
		),
		'4.1.5'  => array(
			'function' => 'zn_update_415',
		),
		'4.3.1'  => array(
			'function' => 'zn_update_431',
		),
		'4.14.1' => array(
			'function' => 'zn_update_4_14_1',
		),
		'4.16.4' => array(
			'function' => 'zn_update_4_16_4',
		),
	);

	return $updates;
}



/*
 *  4.0.5 Update
 */
function zn_update_405() {
	$fs        = ZNHGFW()->getComponent( 'utility' )->getFileSystem();
	$uploads   = wp_upload_dir();
	$file_path = trailingslashit( $uploads['basedir'] ) . 'zn_custom_css.css';
	// Change the custom css saving from file to DB
	if ( $fs->is_file( $file_path ) ) {
		$saved_css = $fs->get_contents( $file_path );
		if ( ! empty( $saved_css ) ) {
			update_option( 'zn_' . ZNHGTFW()->getThemeId() . '_custom_css', $saved_css, false );
		}
		$fs->delete( $file_path );
	}
}

/*
 * 4.0.9 update
 */
function zn_update_409() {
	$config = array(
		'tf_username' => zget_option( 'zn_theme_username', 'advanced_options', false, null ),
		'tf_api'      => zget_option( 'zn_theme_api', 'advanced_options', false, null ),
	);

	update_option( 'kallyas_update_config', $config );
}

/*
 * 4.0.12 update
 */
function zn_update_4012() {
	// Remove the favicon option and set it as site_icon
	$favicon   = zget_option( 'custom_favicon', 'general_options' );
	$site_icon = get_option( 'site_icon' );
	if ( ! empty( $favicon ) && empty( $site_icon ) ) {
		$favicon_image_id = ZngetAttachmentIdFromUrl( $favicon );
		update_option( 'site_icon', $favicon_image_id );
	}
}

/*
 * 4.1.5 update
 * "Fixes" the hide footer option ( see #1396 )
 */
function zn_update_415() {
	// Check if we need to change something
	$show_footer = zget_option( 'footer_show', 'general_options', false, 'yes' );
	$config      = zn_get_pb_template_config( 'footer' );
	if ( $show_footer == 'no' && $config['template'] !== 'no_template' && $config['location'] === 'replace' ) {
		$all_options                                   = zget_option( '', '', true );
		$all_options['general_options']['footer_show'] = 'yes';
		update_option( 'zn_kallyas_optionsv4', $all_options );
	}
}

function zn_update_431() {
	$permalinks     = get_option( 'zn_permalinks' );
	$new_permalinks = array();

	// Convert old permalinks values
	if ( is_array( $permalinks ) ) {
		// Portfolio item
		if ( ! empty( $permalinks['port_item'] ) ) {
			$new_permalinks['portfolio'] = $permalinks['port_item'];
		}

		// Portfolio category
		if ( ! empty( $permalinks['port_tax'] ) ) {
			$new_permalinks['project_category'] = $permalinks['port_tax'];
		}

		// Documentation item
		if ( ! empty( $permalinks['doc_item'] ) ) {
			$new_permalinks['documentation'] = $permalinks['doc_item'];
		}

		// Documentation category
		if ( ! empty( $permalinks['doc_tax'] ) ) {
			$new_permalinks['documentation_category'] = $permalinks['doc_tax'];
		}

		update_option( 'zn_permalinks', $new_permalinks );
	}
}

/**
 * Fix the problem caused by the slug change of the ZNPB-Counter-Element from 'znpb-counter-element' to 'ZNPB-Counter-Element'
 */
function zn_update_4_14_1() {
	$fs = ZNHGFW()->getComponent( 'utility' )->getFileSystem();

	$isWpmu     = ( function_exists( 'is_multisite' ) && is_multisite() );
	$pluginsDir = trailingslashit( $fs->wp_plugins_dir() );

	$oldPluginDir = $pluginsDir . 'znpb-counter-element';
	$newPluginDir = $pluginsDir . 'ZNPB-Counter-Element';

	$oldPluginSlug = 'znpb-counter-element/znpb-counter-element.php';
	$newPluginSlug = 'ZNPB-Counter-Element/znpb-counter-element.php';

	$oldPluginDirExists = $fs->is_dir( $oldPluginDir );
	$newPluginDirExists = $fs->is_dir( $newPluginDir );

	if ( ! function_exists( 'is_plugin_active' ) ) {
		include_once ABSPATH . 'wp-admin/includes/plugin.php';
	}

	//[the #1 problem we're trying to fix]
	if ( $oldPluginDirExists && $newPluginDirExists ) {
		// * which of the two is active? - so we can reactivate if need be
		// * $oldPluginDir while the $newPluginDir should be deleted

		if ( $isWpmu && is_plugin_active_for_network( $newPluginSlug ) ) {
			// network deactivate the new plugin
			deactivate_plugins( $newPluginSlug, false, true );
			// delete the $newPluginDir
			$fs->delete( $newPluginDir, true );
			// network activate the old plugin
			activate_plugin( $oldPluginSlug, '', true );
		} elseif ( is_plugin_active( $newPluginSlug ) ) {
			// deactivate the new plugin
			deactivate_plugins( $newPluginSlug );
			// delete the $newPluginDir
			$fs->delete( $newPluginDir, true );
			// activate the old plugin
			activate_plugin( $oldPluginSlug );
		} else {
			// none active
			// just delete the $newPluginDir
			$fs->delete( $newPluginDir, true );
		}
	}
	//[the #2 problem we're trying to fix ]
	elseif ( $newPluginDirExists ) {
		// * rename dir to $oldPluginDir
		// * if active, reactivate

		if ( ! function_exists( 'rename' ) || ! is_callable( 'rename' ) ) {
			// We can't do anything in this case
			return;
		}

		if ( $isWpmu && is_plugin_active_for_network( $newPluginSlug ) ) {
			// network deactivate the plugin
			deactivate_plugins( $newPluginSlug, false, true );
			// rename $newPluginDir to $oldPluginDir
			rename( $newPluginDir, $oldPluginDir );
			// network activate the plugin
			activate_plugin( $oldPluginSlug, '', true );
		} elseif ( is_plugin_active( $newPluginSlug ) ) {
			// deactivate the plugin
			deactivate_plugins( $newPluginSlug );
			// rename $newPluginDir to $oldPluginDir
			rename( $newPluginDir, $oldPluginDir );
			// activate the plugin
			activate_plugin( $oldPluginSlug );
		} else {
			// not active
			// rename dir to $oldPluginDir
			rename( $newPluginDir, $oldPluginDir );
		}
	}
}

/**
 * Update for v4.16.4
 *
 * In 4.16.4 sidebars were added for portfolio and documentation single pages
 *
 * @return void
 */
function zn_update_4_16_4() {
	// Set the default value for newly added sidebars on portfolio and documentation
	$all_options      = zget_option( '', '', true );
	$default_sidebars = array(
		'layout'  => 'no_sidebar',
		'sidebar' => 'defaultsidebar',
	);

	$all_options['unlimited_sidebars']['portfolio_sidebar']     = $default_sidebars;
	$all_options['unlimited_sidebars']['documentation_sidebar'] = $default_sidebars;

	// $all_options[]
	update_option( 'zn_kallyas_optionsv4', $all_options );
}
