<?php
// =============================================================================
// Redirect all front-end traffic to the live site.
//
// template_redirect fires before any template is loaded for public-facing
// requests. It does NOT fire for /wp-admin/, /wp-login.php, or /wp-json/,
// so the admin UI and REST API continue to work normally.
// =============================================================================

add_action( 'template_redirect', function () {
    wp_redirect( 'https://careertomboy.com', 301 );
    exit;
} );

// =============================================================================
// Custom Post Types
// =============================================================================

add_action( 'init', function () {

    // Gigs
    register_post_type( 'gig', [
        'labels'       => [
            'name'               => 'Gigs',
            'singular_name'      => 'Gig',
            'add_new'            => 'Add New Gig',
            'add_new_item'       => 'Add New Gig',
            'edit_item'          => 'Edit Gig',
            'new_item'           => 'New Gig',
            'view_item'          => 'View Gig',
            'search_items'       => 'Search Gigs',
            'not_found'          => 'No gigs found',
            'not_found_in_trash' => 'No gigs found in Trash',
        ],
        'public'       => true,
        'show_in_rest' => true,
        'rest_base'    => 'gigs',
        'supports'     => [ 'title' ],
        'menu_icon'    => 'dashicons-calendar-alt',
    ] );

    foreach ( [ 'gig_date', 'gig_address', 'gig_ticket_url', 'gig_supporting', 'gig_notes' ] as $key ) {
        register_meta( 'post', $key, [
            'object_subtype' => 'gig',
            'show_in_rest'   => true,
            'single'         => true,
            'type'           => 'string',
        ] );
    }

    register_meta( 'post', 'gig_is_private', [
        'object_subtype' => 'gig',
        'show_in_rest'   => true,
        'single'         => true,
        'type'           => 'boolean',
    ] );

    // Songs
    register_post_type( 'song', [
        'labels'       => [
            'name'               => 'Songs',
            'singular_name'      => 'Song',
            'add_new'            => 'Add New Song',
            'add_new_item'       => 'Add New Song',
            'edit_item'          => 'Edit Song',
            'new_item'           => 'New Song',
            'view_item'          => 'View Song',
            'search_items'       => 'Search Songs',
            'not_found'          => 'No songs found',
            'not_found_in_trash' => 'No songs found in Trash',
        ],
        'public'       => true,
        'show_in_rest' => true,
        'rest_base'    => 'songs',
        'supports'     => [ 'title' ],
        'menu_icon'    => 'dashicons-format-audio',
    ] );

    register_meta( 'post', 'song_artist', [
        'object_subtype' => 'song',
        'show_in_rest'   => true,
        'single'         => true,
        'type'           => 'string',
    ] );

    // Videos
    register_post_type( 'video', [
        'labels'       => [
            'name'               => 'Videos',
            'singular_name'      => 'Video',
            'add_new'            => 'Add New Video',
            'add_new_item'       => 'Add New Video',
            'edit_item'          => 'Edit Video',
            'new_item'           => 'New Video',
            'view_item'          => 'View Video',
            'search_items'       => 'Search Videos',
            'not_found'          => 'No videos found',
            'not_found_in_trash' => 'No videos found in Trash',
        ],
        'public'       => true,
        'show_in_rest' => true,
        'rest_base'    => 'videos',
        'supports'     => [ 'title' ],
        'menu_icon'    => 'dashicons-video-alt3',
    ] );

    foreach ( [ 'video_youtube_id', 'video_description' ] as $key ) {
        register_meta( 'post', $key, [
            'object_subtype' => 'video',
            'show_in_rest'   => true,
            'single'         => true,
            'type'           => 'string',
        ] );
    }

    register_meta( 'post', 'video_is_featured', [
        'object_subtype' => 'video',
        'show_in_rest'   => true,
        'single'         => true,
        'type'           => 'boolean',
    ] );

    // Band Members
    register_post_type( 'band_member', [
        'labels'       => [
            'name'               => 'Members',
            'singular_name'      => 'Member',
            'add_new'            => 'Add New Member',
            'add_new_item'       => 'Add New Member',
            'edit_item'          => 'Edit Member',
            'new_item'           => 'New Member',
            'view_item'          => 'View Member',
            'search_items'       => 'Search Members',
            'not_found'          => 'No members found',
            'not_found_in_trash' => 'No members found in Trash',
        ],
        'public'       => true,
        'show_in_rest' => true,
        'rest_base'    => 'band_members',
        'supports'     => [ 'title', 'thumbnail' ],
        'menu_icon'    => 'dashicons-groups',
    ] );

    foreach ( [ 'member_role', 'member_bio' ] as $key ) {
        register_meta( 'post', $key, [
            'object_subtype' => 'band_member',
            'show_in_rest'   => true,
            'single'         => true,
            'type'           => 'string',
        ] );
    }

    // Booking page — Google Form URL stored as meta so it can be updated
    // without touching the page body. The page content (headings, paragraphs)
    // is edited directly in the WordPress block editor.
    register_meta( 'post', 'booking_form_url', [
        'object_subtype' => 'page',
        'show_in_rest'   => true,
        'single'         => true,
        'type'           => 'string',
    ] );

} );

// =============================================================================
// Admin List Columns
// =============================================================================

add_filter( 'manage_gig_posts_columns', function ( $columns ) {
    $columns['gig_date'] = 'Gig Date';
    return $columns;
} );

add_action( 'manage_gig_posts_custom_column', function ( $column, $post_id ) {
    if ( $column === 'gig_date' ) {
        $date = get_post_meta( $post_id, 'gig_date', true );
        echo $date ? esc_html( date( 'M j, Y g:i a', strtotime( $date ) ) ) : '—';
    }
}, 10, 2 );

add_filter( 'manage_song_posts_columns', function ( $columns ) {
    $columns['song_artist'] = 'Artist';
    return $columns;
} );

add_action( 'manage_song_posts_custom_column', function ( $column, $post_id ) {
    if ( $column === 'song_artist' ) {
        $artist = get_post_meta( $post_id, 'song_artist', true );
        echo $artist ? esc_html( $artist ) : '—';
    }
}, 10, 2 );

// =============================================================================
// Custom Meta Boxes
//
// Each CPT gets its own meta box with only its relevant fields.
// Removing 'custom-fields' from supports hides the generic meta box.
// =============================================================================

add_action( 'add_meta_boxes', function () {

    add_meta_box( 'ct_gig_details', 'Gig Details', function ( $post ) {
        wp_nonce_field( 'ct_gig_save', 'ct_gig_nonce' );
        $date       = get_post_meta( $post->ID, 'gig_date', true );
        $address    = get_post_meta( $post->ID, 'gig_address', true );
        $ticket_url = get_post_meta( $post->ID, 'gig_ticket_url', true );
        $supporting = get_post_meta( $post->ID, 'gig_supporting', true );
        $notes      = get_post_meta( $post->ID, 'gig_notes', true );
        $is_private = get_post_meta( $post->ID, 'gig_is_private', true );
        ?>
        <table class="form-table"><tbody>
        <tr><th><label for="gig_date">Date</label></th>
            <td><input type="datetime-local" id="gig_date" name="gig_date" value="<?php echo esc_attr( $date ); ?>" class="regular-text"></td></tr>
        <tr><th><label for="gig_address">Address</label></th>
            <td><input type="text" id="gig_address" name="gig_address" value="<?php echo esc_attr( $address ); ?>" class="regular-text">
                <p class="description">Leave blank for private gigs.</p></td></tr>
        <tr><th><label for="gig_ticket_url">Ticket URL</label></th>
            <td><input type="url" id="gig_ticket_url" name="gig_ticket_url" value="<?php echo esc_attr( $ticket_url ); ?>" class="regular-text"></td></tr>
        <tr><th><label for="gig_supporting">Supporting Act</label></th>
            <td><input type="text" id="gig_supporting" name="gig_supporting" value="<?php echo esc_attr( $supporting ); ?>" class="regular-text"></td></tr>
        <tr><th><label for="gig_notes">Notes</label></th>
            <td><input type="text" id="gig_notes" name="gig_notes" value="<?php echo esc_attr( $notes ); ?>" class="regular-text"></td></tr>
        <tr><th><label for="gig_is_private">Private</label></th>
            <td><input type="checkbox" id="gig_is_private" name="gig_is_private" value="1" <?php checked( $is_private, '1' ); ?>>
                <label for="gig_is_private">Hide address and details on the site</label></td></tr>
        </tbody></table>
        <?php
    }, 'gig', 'normal', 'high' );

    add_meta_box( 'ct_song_details', 'Song Details', function ( $post ) {
        wp_nonce_field( 'ct_song_save', 'ct_song_nonce' );
        $artist = get_post_meta( $post->ID, 'song_artist', true );
        ?>
        <table class="form-table"><tbody>
        <tr><th><label for="song_artist">Artist</label></th>
            <td><input type="text" id="song_artist" name="song_artist" value="<?php echo esc_attr( $artist ); ?>" class="regular-text"></td></tr>
        </tbody></table>
        <?php
    }, 'song', 'normal', 'high' );

    add_meta_box( 'ct_video_details', 'Video Details', function ( $post ) {
        wp_nonce_field( 'ct_video_save', 'ct_video_nonce' );
        $youtube_id  = get_post_meta( $post->ID, 'video_youtube_id', true );
        $description = get_post_meta( $post->ID, 'video_description', true );
        $is_featured = get_post_meta( $post->ID, 'video_is_featured', true );
        ?>
        <table class="form-table"><tbody>
        <tr><th><label for="video_youtube_id">YouTube ID</label></th>
            <td><input type="text" id="video_youtube_id" name="video_youtube_id" value="<?php echo esc_attr( $youtube_id ); ?>" class="regular-text">
                <p class="description">The ID from the YouTube URL, e.g. <code>dQw4w9WgXcQ</code>.</p></td></tr>
        <tr><th><label for="video_description">Description</label></th>
            <td><input type="text" id="video_description" name="video_description" value="<?php echo esc_attr( $description ); ?>" class="regular-text"></td></tr>
        <tr><th><label for="video_is_featured">Featured</label></th>
            <td><input type="checkbox" id="video_is_featured" name="video_is_featured" value="1" <?php checked( $is_featured, '1' ); ?>>
                <label for="video_is_featured">Show as the featured video on the site</label></td></tr>
        </tbody></table>
        <?php
    }, 'video', 'normal', 'high' );

    add_meta_box( 'ct_member_details', 'Member Details', function ( $post ) {
        wp_nonce_field( 'ct_member_save', 'ct_member_nonce' );
        $role = get_post_meta( $post->ID, 'member_role', true );
        $bio  = get_post_meta( $post->ID, 'member_bio', true );
        ?>
        <table class="form-table"><tbody>
        <tr><th><label for="member_role">Role</label></th>
            <td><input type="text" id="member_role" name="member_role" value="<?php echo esc_attr( $role ); ?>" class="regular-text">
                <p class="description">e.g. Guitar, Bass, Vocals</p></td></tr>
        <tr><th><label for="member_bio">Bio</label></th>
            <td><textarea id="member_bio" name="member_bio" rows="4" class="large-text"><?php echo esc_textarea( $bio ); ?></textarea></td></tr>
        </tbody></table>
        <?php
    }, 'band_member', 'normal', 'high' );

} );

add_action( 'save_post', function ( $post_id ) {
    if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) return;
    if ( wp_is_post_revision( $post_id ) ) return;

    $post_type = get_post_type( $post_id );

    if ( $post_type === 'gig' && isset( $_POST['ct_gig_nonce'] ) && wp_verify_nonce( $_POST['ct_gig_nonce'], 'ct_gig_save' ) ) {
        update_post_meta( $post_id, 'gig_date',       sanitize_text_field( $_POST['gig_date'] ?? '' ) );
        update_post_meta( $post_id, 'gig_address',    sanitize_text_field( $_POST['gig_address'] ?? '' ) );
        update_post_meta( $post_id, 'gig_ticket_url', esc_url_raw( $_POST['gig_ticket_url'] ?? '' ) );
        update_post_meta( $post_id, 'gig_supporting', sanitize_text_field( $_POST['gig_supporting'] ?? '' ) );
        update_post_meta( $post_id, 'gig_notes',      sanitize_text_field( $_POST['gig_notes'] ?? '' ) );
        update_post_meta( $post_id, 'gig_is_private', isset( $_POST['gig_is_private'] ) ? '1' : '' );
    }

    if ( $post_type === 'song' && isset( $_POST['ct_song_nonce'] ) && wp_verify_nonce( $_POST['ct_song_nonce'], 'ct_song_save' ) ) {
        update_post_meta( $post_id, 'song_artist', sanitize_text_field( $_POST['song_artist'] ?? '' ) );
    }

    if ( $post_type === 'video' && isset( $_POST['ct_video_nonce'] ) && wp_verify_nonce( $_POST['ct_video_nonce'], 'ct_video_save' ) ) {
        update_post_meta( $post_id, 'video_youtube_id',  sanitize_text_field( $_POST['video_youtube_id'] ?? '' ) );
        update_post_meta( $post_id, 'video_description', sanitize_text_field( $_POST['video_description'] ?? '' ) );
        update_post_meta( $post_id, 'video_is_featured', isset( $_POST['video_is_featured'] ) ? '1' : '' );
    }

    if ( $post_type === 'band_member' && isset( $_POST['ct_member_nonce'] ) && wp_verify_nonce( $_POST['ct_member_nonce'], 'ct_member_save' ) ) {
        update_post_meta( $post_id, 'member_role', sanitize_text_field( $_POST['member_role'] ?? '' ) );
        update_post_meta( $post_id, 'member_bio',  sanitize_textarea_field( $_POST['member_bio'] ?? '' ) );
    }
} );

// =============================================================================
// Song List block — PHP registration
//
// Registering the block server-side gives it a render_callback, so WordPress
// includes the marker in content.rendered (the REST API field). Without this,
// do_blocks() would silently drop the block comment from rendered output.
// =============================================================================

add_action( 'init', function () {
    register_block_type( 'career-tomboy/song-list', [
        'render_callback' => function () {
            return '<div data-ct-block="song-list"></div>';
        },
    ] );
} );

// =============================================================================
// Block Editor Assets
// =============================================================================

add_action( 'enqueue_block_editor_assets', function () {
    wp_enqueue_script(
        'ct-blocks',
        get_stylesheet_directory_uri() . '/blocks.js',
        [ 'wp-blocks', 'wp-element' ],
        '1.0.0'
    );
} );

// =============================================================================
// Vercel Deploy Hook
//
// Add to wp-config.php:
//   define( 'CT_VERCEL_DEPLOY_HOOK', 'https://api.vercel.com/v1/integrations/deploy/YOUR_HOOK_URL' );
// =============================================================================

function ct_trigger_vercel_deploy() {
    if ( ! defined( 'CT_VERCEL_DEPLOY_HOOK' ) || empty( CT_VERCEL_DEPLOY_HOOK ) ) {
        return;
    }
    wp_remote_post( CT_VERCEL_DEPLOY_HOOK, [ 'blocking' => false ] );
}

$ct_managed_types = [ 'gig', 'song', 'video', 'band_member', 'page' ];

// Trigger on publish / update
add_action( 'save_post', function ( $post_id, $post ) use ( $ct_managed_types ) {
    if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) return;
    if ( wp_is_post_revision( $post_id ) ) return;
    if ( ! in_array( $post->post_type, $ct_managed_types ) ) return;
    if ( $post->post_status !== 'publish' ) return;

    ct_trigger_vercel_deploy();
}, 10, 2 );

// Trigger on trash / delete
add_action( 'trashed_post', function ( $post_id ) use ( $ct_managed_types ) {
    if ( in_array( get_post_type( $post_id ), $ct_managed_types ) ) {
        ct_trigger_vercel_deploy();
    }
} );
