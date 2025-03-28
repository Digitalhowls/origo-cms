<?php if ( ! defined( 'ABSPATH' ) ) {
	return; }

class ZnMegaMenu {

	static $smartAreas = array();

	function __construct() {

		if ( ZNHGTFW()->isRequest( 'admin' ) ) {
			require 'class-mega-menu-admin.php';
		}

		// ADD THE MEGA MENU WALKER AND CLASSES
		add_filter( 'wp_nav_menu_args', array( &$this, 'enable_custom_walker' ), 100 );

		// Check if we need to render smart areas
		add_action( 'template_redirect', array( $this, 'load_smart_areas' ), 999 );
	}

	public static function getSmartAreas() {
		if ( empty( self::$smartAreas ) ) {
			self::$smartAreas = array( '' => '-- Select a template --' );
			$all_pb_templates = get_posts(
				array(
					'post_type'      => 'znpb_template_mngr',
					'posts_per_page' => - 1,
					'post_status'    => 'publish',
				)
			);

			foreach ( $all_pb_templates as $key => $value ) {
				self::$smartAreas[ $value->ID ] = $value->post_title;
			}
		}

		return self::$smartAreas;
	}

	public function load_smart_areas() {
		// Get all menu items for 'main_navigation'
		$menu_location = 'main_navigation';
		$locations     = get_nav_menu_locations();

		if ( empty( $locations[ $menu_location ] ) ) {
			return;
		}

		$menu = wp_get_nav_menu_object( $locations[ $menu_location ] );
		if ( ! $menu ) {
			return;
		}

		$menu_items = wp_get_nav_menu_items( $menu->term_id, array( 'update_post_term_cache' => false ) );

		if ( ! is_array( $menu_items ) ) {
			return;
		}

		foreach ( $menu_items as $key => $menu_item ) {
			if ( $menu_item->menu_item_parent != '0' ) {
				continue;
			}

			// Check if Mega menu is enabled and if we have a smart area
			$mm_active     = get_post_meta( $menu_item->ID, '_menu_item_zn_mega_menu_enable', true );
			$mm_smart_area = get_post_meta( $menu_item->ID, '_menu_item_zn_mega_menu_smart_area', true );
			$mm_smart_area = apply_filters( 'kallyas/mega_menu/smart_area/post_id', $mm_smart_area );

			if ( $mm_active && $mm_smart_area ) {
				$pb_data = get_post_meta( $mm_smart_area, 'zn_page_builder_els', true );
				if ( ! empty( $pb_data ) ) {
					// Notify that we're using a smart area
					ZNB()->smart_area->registerSmartArea( $mm_smart_area );
					ZNB()->frontend->setupElements( $pb_data );
				}
			}
		}

		// check to see if a smart area is set for 1st level
	}

	/**
	 * Replaces the default arguments for the front end menu creation with new ones
	 */
	function enable_custom_walker( $arguments ) {

		if ( $arguments['walker'] == 'znmegamenu' ) {
			$arguments['walker']          = new ZnWalkerNavMenu();
			$arguments['container_class'] = $arguments['container_class'] .= ' zn_mega_wrapper ';
			$arguments['menu_class']      = $arguments['menu_class'] .= ' zn_mega_menu ';
		}

		return $arguments;
	}
}

/**
 * Create HTML list of nav menu items. ( COPIED FROM DEFAULT WALKER )
 *
 * @package WordPress
 * @since 3.0.0
 * @uses Walker
 */
class ZnWalkerNavMenu extends Walker {
	/**
	 * What the class handles.
	 *
	 * @see Walker::$tree_type
	 * @since 3.0.0
	 * @var string
	 */
	var $tree_type = array( 'post_type', 'taxonomy', 'custom' );

	/**
	 * Database fields to use.
	 *
	 * @see Walker::$db_fields
	 * @since 3.0.0
	 * @todo Decouple this.
	 * @var array
	 */
	var $db_fields       = array(
		'parent' => 'menu_item_parent',
		'id'     => 'db_id',
	);
	var $mm_active       = false;
	var $mm_smart_area   = false;
	var $max_columns     = 4;
	var $columns         = 0;
	var $childrens_count = 0;
	var $isDummyChildren = false;

	private $_bgImage = 0;

	function __construct() {
		$this->max_columns = apply_filters( 'zn_mega_menu_columns', 4 );

		//@params: $output = '' , $bgImage = 0, $indent = ''
		add_filter( 'zn_hg_mega_menu_inner_wrapper_start', array( __CLASS__, 'megaMenuContainerWrapperStart' ), 10, 3 );
		//@params: $endTag = ''
		add_filter( 'zn_hg_mega_menu_inner_wrapper_end', array( __CLASS__, 'megaMenuContainerWrapperEnd' ), 10, 1 );
	}


	/**
	 * Perform several checks and fill the class values
	 *
	 * @param string $element The current menu item
	 * @param int    $children_elements  The element childrens
	 * @param array  $max_depth
	 * @param array  $depth
	 * @param array  $args
	 * @param array  $output
	 */
	function display_element( $element, &$children_elements, $max_depth, $depth, $args, &$output ) {

		if ( $depth === 0 ) {

			$this->isDummyChildren = false;

			// CHECK IF MENU IS ACTIVE
			$this->mm_active     = get_post_meta( $element->ID, '_menu_item_zn_mega_menu_enable', true );
			$this->mm_smart_area = get_post_meta( $element->ID, '_menu_item_zn_mega_menu_smart_area', true );

			//#! If has bg image set
			$this->_bgImage = get_post_meta( $element->ID, '_menu_item_zn_mega_menu_bg_image', true );

			// Set a dummy child if we don't have any childrens
			// It is needed to trigger the sub-menu dropdown
			if ( $this->mm_active && $this->mm_smart_area && empty( $children_elements[ $element->ID ] ) ) {
				$children_elements[ $element->ID ] = array(
					'0' => array(),
				);
				$this->isDummyChildren             = true;
			}

			// COUNT ALL MEGA MENU CHILDREN
			if ( $this->mm_active && ! empty( $children_elements[ $element->ID ] ) ) {
				$this->childrens_count = count( $children_elements[ $element->ID ] );
			}
		}

		// DO THE NORMAL display_element();
		return parent::display_element( $element, $children_elements, $max_depth, $depth, $args, $output );
	}

	/**
	 * Starts the list before the elements are added.
	 *
	 * @see Walker::start_lvl()
	 *
	 * @since 3.0.0
	 *
	 * @param string $output Passed by reference. Used to append additional content.
	 * @param int    $depth  Depth of menu item. Used for padding.
	 * @param array  $args   An array of arguments. @see wp_nav_menu()
	 */
	function start_lvl( &$output, $depth = 0, $args = array() ) {
		$indent = str_repeat( "\t", $depth );

		if ( $depth === 0 && $this->mm_active ) {
			//  If we have a smart area
			if ( $this->mm_smart_area ) {

				$output .= "\n$indent<div class='zn_mega_container container zn-megaMenuSmartArea'>\n";

				$pb_data = get_post_meta( $this->mm_smart_area, 'zn_page_builder_els', true );

				ob_start();
				echo '<div class="zn-megaMenuSmartArea-content">';
					ZNB()->frontend->renderUneditableContent( $pb_data, $this->mm_smart_area );
				echo '</div>';
				$output .= ob_get_clean();

				// don't display empty ul'
				if ( ! $this->isDummyChildren ) {
					$output .= "<ul class=\"clearfix\">\n";
				}
			}
			// ADD THE MEGA MENU WRAPPER
			else {
				$output .= apply_filters( 'zn_hg_mega_menu_inner_wrapper_start', '', $this->_bgImage, $indent );
			}
		} elseif ( $this->mm_active ) {
				$output .= "\n$indent<ul class=\"clearfix\">\n";
		} else {
			$output .= "\n$indent<ul class=\"sub-menu clearfix\">\n";
		}
	}



	public static function megaMenuContainerWrapperStart( $output, $bgImage = 0, $indent = '' ) {

		$cssClasses = array( 'zn_mega_container', 'container' );

		//#! Add the extra class
		if ( $bgImage ) {
			array_push( $cssClasses, 'zn_mega-has-image' );
		}

		//#! Add the style attribute
		$imageAtts = '';
		if ( $bgImage ) {
			$image = wp_get_attachment_image_src( $bgImage, 'full' );
			if ( ! empty( $image[0] ) ) {
				$imageAtts = ' style="background-image: url(' . esc_url( $image[0] ) . ');"';
			}
		}

		$output .= "\n$indent<div class='" . implode( ' ', $cssClasses ) . "'";

		$output .= ">\n";

		$output .= '<div class="zn_mega_menu_container_wrapper" ' . $imageAtts . '>';

		$output  = apply_filters( 'hg_mega_menu_list_before', $output );
		$output .= "<ul class=\"clearfix\">\n";

		return $output;
	}

	public static function megaMenuContainerWrapperEnd( $endTag ) {
		$output = apply_filters( 'hg_mega_menu_list_after', $endTag );
		return $output;
	}

	/**
	 * Ends the list of after the elements are added.
	 *
	 * @see Walker::end_lvl()
	 *
	 * @since 3.0.0
	 *
	 * @param string $output Passed by reference. Used to append additional content.
	 * @param int    $depth  Depth of menu item. Used for padding.
	 * @param array  $args   An array of arguments. @see wp_nav_menu()
	 */
	function end_lvl( &$output, $depth = 0, $args = array() ) {
		$indent = str_repeat( "\t", $depth );

		if ( $depth === 0 && $this->isDummyChildren ) {
		} else {
			$output .= "$indent</ul>\n";
		}

		if ( $depth === 0 && $this->mm_active ) {
			//  If we have a smart area
			if ( $this->mm_smart_area ) {
				$output .= '</div>';
			} else {
				//#! Use this filter to add content
				$output .= apply_filters( 'zn_hg_mega_menu_inner_wrapper_end', '</div></div>' );
			}

			// RESET THE COUNTERS
			$this->columns = 0;
		}
	}


	/**
	 * Returns the colum css class based on column number
	 * @param  string $col The number of columns
	 * @return string The css class specific for that columns number
	 */
	function zn_get_col_size( $col ) {
		$cols = array(
			'1' => 'col-sm-12',
			'2' => 'col-sm-6',
			'3' => 'col-sm-4',
			'4' => 'col-sm-3',
			'5' => 'col-sm-4 col-sm-1-5',
			'6' => 'col-sm-6 col-md-4 col-lg-2',
		);
		return $cols[ $col ];
	}


	/**
	 * Start the element output.
	 *
	 * @see Walker::start_el()
	 *
	 * @since 3.0.0
	 *
	 * @param string $output Passed by reference. Used to append additional content.
	 * @param object $item   Menu item data object.
	 * @param int    $depth  Depth of menu item. Used for padding.
	 * @param array  $args   An array of arguments. @see wp_nav_menu()
	 * @param int    $id     Current item ID.
	 */
	function start_el( &$output, $item, $depth = 0, $args = array(), $id = 0 ) {

		$indent = ( $depth ) ? str_repeat( "\t", $depth ) : '';

		// depth dependent classes
		$depth_classes     = array(
			( $depth == 0 ? 'main-menu-item-top' : 'main-menu-item-sub' ),
			( $depth >= 2 ? 'main-menu-item-sub-sub' : '' ),
			( $depth % 2 ? 'menu-item-odd' : 'menu-item-even' ),
			'menu-item-depth-' . $depth,
		);
		$depth_class_names = ' ' . esc_attr( implode( ' ', $depth_classes ) );

		$class_names = $value = $column_class = '';

		// ONLY CHECK ON LEVEL 1 SUBMENUS
		if ( $depth == 1 && $this->mm_active ) {

			++$this->columns;

			if ( $this->childrens_count > $this->max_columns ) {
				// CHECK IF WE HAVE MORE COLUMNS THAN THE MAX COLUMNS
				if ( $this->columns > $this->max_columns ) {

					$output .= "\n</ul><ul class=\"zn_mega_row_start\">\n";

					if ( $this->childrens_count - $this->max_columns < $this->childrens_count ) {

						$column_class = $this->zn_get_col_size( $this->max_columns );
					} else {
						$column_class = $this->zn_get_col_size( $this->childrens_count - $this->max_columns );
					}
					$this->columns = 1;
				} else {
					$column_class = $this->zn_get_col_size( $this->max_columns );
				}
			} else {
				$column_class = $this->zn_get_col_size( $this->childrens_count );
			}
		}

		$classes   = empty( $item->classes ) ? array() : (array) $item->classes;
		$classes[] = 'menu-item-' . $item->ID;

		// Added mega menu class to parent li
		if ( $depth === 0 && $this->mm_active ) {
			$classes[] = 'menu-item-mega-parent';
			$classes[] = 'menu-item-has-children';
		}

		$class_names = join( ' ', apply_filters( 'nav_menu_css_class', array_filter( $classes ), $item, $args ) );
		$class_names = ' class="main-menu-item ' . esc_attr( $class_names ) . ' ' . $column_class . $depth_class_names . '"';

		$id = apply_filters( 'nav_menu_item_id', 'menu-item-' . $item->ID, $item, $args );
		$id = $id ? ' id="' . esc_attr( $id ) . '"' : '';

		$output .= $indent . '<li' . $id . $value . $class_names . '>';

		$atts           = array();
		$atts['title']  = ! empty( $item->attr_title ) ? $item->attr_title : '';
		$atts['target'] = ! empty( $item->target ) ? $item->target : '';
		$atts['rel']    = ! empty( $item->xfn ) ? $item->xfn : '';
		$atts['href']   = ! empty( $item->url ) ? $item->url : '';
		$atts['class']  = ! empty( $item->class ) ? $item->class : '';
		$atts['class'] .= ' main-menu-link ' . ( $depth > 0 ? 'main-menu-link-sub' : 'main-menu-link-top' );

		// STYLE THE SUBMENU TITLES
		if ( $depth == 1 && $this->mm_active ) {
			$atts['class'] .= ' zn_mega_title ';
		}

		if ( $depth == 1 && $this->mm_active && get_post_meta( $item->ID, '_menu_item_zn_mega_menu_headers', true ) ) {
			$atts['class'] .= ' zn_mega_title_hide ';
		}

		$atts = apply_filters( 'nav_menu_link_attributes', $atts, $item, $args );

		$attributes = '';
		foreach ( $atts as $attr => $value ) {
			if ( ! empty( $value ) ) {
				$value       = ( 'href' === $attr ) ? esc_url( $value ) : esc_attr( $value );
				$attributes .= ' ' . $attr . '="' . $value . '"';
			}
		}

		// SHOW BADGE
		// LABEL
		$key        = 'menu_item_zn_mega_menu_label';
		$badge_text = get_post_meta( $item->ID, '_' . $key, true );

		$item_output  = $args->before;
		$item_output .= '<a' . $attributes . '>';
		/** This filter is documented in wp-includes/post-template.php */
		$item_output .= $args->link_before . apply_filters( 'the_title', $item->title, $item->ID ) . $args->link_after;
		$item_output .= ! empty( $badge_text ) ? '<span class="zn-mega-new-item">' . $badge_text . '</span>' : '';
		$item_output .= '</a>';
		$item_output .= $args->after;

		/**
		 * Filter a menu item's starting output.
		 *
		 * The menu item's starting output only includes $args->before, the opening <a>,
		 * the menu item's title, the closing </a>, and $args->after. Currently, there is
		 * no filter for modifying the opening and closing <li> for a menu item.
		 *
		 * @since 3.0.0
		 *
		 * @param string $item_output The menu item's starting HTML output.
		 * @param object $item        Menu item data object.
		 * @param int    $depth       Depth of menu item. Used for padding.
		 * @param array  $args        An array of arguments. @see wp_nav_menu()
		 */
		$output .= apply_filters( 'walker_nav_menu_start_el', $item_output, $item, $depth, $args );
	}

	/**
	 * Ends the element output, if needed.
	 *
	 * @see Walker::end_el()
	 *
	 * @since 3.0.0
	 *
	 * @param string $output Passed by reference. Used to append additional content.
	 * @param object $item   Page data object. Not used.
	 * @param int    $depth  Depth of page. Not Used.
	 * @param array  $args   An array of arguments. @see wp_nav_menu()
	 */
	function end_el( &$output, $item, $depth = 0, $args = array() ) {
		$output .= "</li>\n";
	}
} // Walker_Nav_Menu

return new ZnMegaMenu();
