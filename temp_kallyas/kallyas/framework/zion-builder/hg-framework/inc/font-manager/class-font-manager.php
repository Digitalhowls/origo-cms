<?php if ( ! defined('ABSPATH')) {
	return;
}

class ZnHgFw_FontManager {

	/**
	 * Font list cache
	 */
	

	function __construct() {
		// Add actions
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_fonts' ), 5);
		// Add filters
		add_filter( 'tiny_mce_before_init', array( $this, 'add_fonts_dropdown_to_mce' ) );
		add_filter( 'zn_dynamic_css', array( $this, 'add_fonts_styles' ) );
	}

	/**
	 * Get the google fonts from the json file
	 * 
	 * @return array The Google fonts list
	 */
	public function get_all_google_fonts() {
		$fonts = file_get_contents( dirname(__FILE__) . '/google_fonts.json' );
		$fonts = json_decode($fonts, 1);

		// If the fonts list is empty, return an empty array
		if ( empty( $fonts ) || empty( $fonts['items'] ) ) {
			return [];
		}

		return $fonts['items'];
	}

	/**
	 * Add fonts to TinyMCE fonts dropdown
	 * @param [type] $initArray [description]
	 */
	function add_fonts_dropdown_to_mce($initArray) {
		// Custom Google Fonts
		$custom_fonts_list = '';

		if ( $google_fonts = $this->get_google_fonts() ) {
			if ( is_array( $google_fonts ) && ! empty( $google_fonts ) ) {
				foreach ( $google_fonts as $key => $font ) {
					if (isset($font['font_family']) && ! empty($font['font_family'])) {
						$custom_fonts_list .= $font['font_family'] . '=' . $font['font_family'] . ';';
					}
				}
			}
		}

		// Custom Fonts
		if ( $custom_fonts = $this->get_custom_fonts() ) {
			if ( is_array( $custom_fonts ) && ! empty( $custom_fonts ) ) {
				foreach ( $custom_fonts as $font ) {
					if ( $font_name = $font['cf_name'] ) {
						$custom_fonts_list .= $font_name . '=' . $font_name . ';';
					}
				}
			}
		}

		$initArray['font_formats'] = $custom_fonts_list . 'Andale Mono=andale mono,times;Arial=arial,helvetica,sans-serif;Arial Black=arial black,avant garde;Book Antiqua=book antiqua,palatino;Comic Sans MS=comic sans ms,sans-serif;Courier New=courier new,courier;Georgia=georgia,palatino;Helvetica=helvetica;Impact=impact,chicago;Symbol=symbol;Tahoma=tahoma,arial,helvetica,sans-serif;Terminal=terminal,monaco;Times New Roman=times new roman,times;Trebuchet MS=trebuchet ms,geneva;Verdana=verdana,geneva;Webdings=webdings;Wingdings=wingdings,zapf dingbats';
		return $initArray;
	}

	/**
	 * Adds custom font css code to dynamic class
	 * @uses: 'zn_dynamic_css' filter
	 * @param mixed $css
	 */
	function add_fonts_styles( $css ) {
		$css .= $this->get_custom_fonts_styles();

		return $css;
	}



	public function get_custom_fonts_styles() {
		$css = '';

		// TODO: use an independent option instead of Kallyas one
		$custom_fonts = $this->get_custom_fonts();

		// Don't do anything if we don't need to
		if ( empty( $custom_fonts ) ) {
			return $css;
		}

		if ( is_array( $custom_fonts ) ) {
			foreach ( $custom_fonts as $font ) {
				if ( $font_name = $font['cf_name'] ) {
					$cf_fontweight = $font['cf_fontweight'];
					$font_weight   = $cf_fontweight ? 'font-weight: ' . $cf_fontweight . ' ;' : '';

					$font_src = '';
					// .eot
					if ( $cf_eot = $font['cf_eot'] ) {
						$cf_eot = zn_fix_insecure_content($cf_eot);
						$font_src .= "src: url('{$cf_eot}');";
					}

					// Rest of font files
					if ( ! empty( $font['cf_woff'] ) || ! empty( $font['cf_ttf'] ) || ! empty( $font['cf_svg'] ) ) {
						$font_src .= 'src: ';

						if ( $cf_eot = $font['cf_eot'] ) {
							$cf_eot = zn_fix_insecure_content($cf_eot);
							$font_src .= "url('{$cf_eot}?#iefix') format('eot'),";
						}

						if ( $cf_woff = $font['cf_woff'] ) {
							$cf_woff = zn_fix_insecure_content($cf_woff);
							$font_src .= "url('{$cf_woff}') format('woff'),";
						}

						if ( $cf_ttf = $font['cf_ttf'] ) {
							$cf_ttf = zn_fix_insecure_content($cf_ttf);
							$font_src .= "url('{$cf_ttf}') format('truetype'),";
						}

						if ( $cf_svg = $font['cf_svg'] ) {
							$cf_svg = zn_fix_insecure_content($cf_svg);
							$font_src .= "url('{$cf_svg}') format('svg'),";
						}

						$font_src = rtrim($font_src, ',');

						$font_src .= ';';
					}


					$css .= "
						@font-face {
							font-family: '{$font_name}';
							{$font_weight}
							{$font_src}
						}
					";
				}
			}
		}

		return $css;
	}

	/**
	 * Add the fonts css to head
	 * @return [type] [description]
	 */
	public function enqueue_fonts() {
		$google_fonts = $this->get_google_fonts();
		$subsets      = '';

		if ( $google_subsets = $this->get_google_fonts_subset() ) {
			$subsets = '&subset=' . implode(',', $google_subsets);
		}

		if ( ! empty( $google_fonts ) && is_array( $google_fonts ) ) {
			$all_final_fonts = array();

			foreach ($google_fonts as $key => $font) {
				if ( isset($font['font_variants']) ) {
					$variants          = implode(',', array_values($font['font_variants']) );
					$all_final_fonts[] = $key . ':' . $variants;
				} else {
					$all_final_fonts[] = $key;
				}
			}

			$gfont = implode('|', $all_final_fonts);
			wp_enqueue_style( 'zn_all_g_fonts', '//fonts.googleapis.com/css?family=' . $gfont . '' . $subsets);
		}
	}

	function get_google_fonts() {
		return apply_filters( 'znhgfw_google_fonts_list', array() );
	}

	function get_google_fonts_subset() {
		return apply_filters( 'znhgfw_google_fonts_subsets', array() );
	}

	function get_custom_fonts() {
		return apply_filters( 'znhgfw_custom_fonts_list', array() );
	}

	function get_fonts_array() {
		$fonts = array(
			'arial'    => 'Arial',
			'verdana'  => 'Verdana, Geneva',
			'trebuchet'=> 'Trebuchet',
			'georgia'  => 'Georgia',
			'times'    => 'Times New Roman',
			'tahoma'   => 'Tahoma, Geneva',
			'palatino' => 'Palatino',
			'helvetica'=> 'Helvetica',
		);

		if ( $google_fonts = $this->get_google_fonts() ) {
			if ( is_array( $google_fonts ) ) {
				foreach ( $google_fonts as $key => $font ) {
					$fonts[$font['font_family']] = $font['font_family'];
				}
			}
		}

		// Custom font option
		if ( $custom_fonts = $this->get_custom_fonts() ) {
			if ( is_array( $custom_fonts ) ) {
				foreach ( $custom_fonts as $font ) {
					// $fonts[$font['font_family']] = $font['font_family'];
					if ( ! empty( $font['cf_name'] ) ) {
						$fonts[$font['cf_name']] = $font['cf_name'];
					}
				}
			}
		}

		return $fonts;
	}
}

return new ZnHgFw_FontManager();
