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
        'label'        => 'Gigs',
        'public'       => true,
        'show_in_rest' => true,
        'rest_base'    => 'gigs',
        'supports'     => [ 'title', 'custom-fields' ],
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
        'label'        => 'Songs',
        'public'       => true,
        'show_in_rest' => true,
        'rest_base'    => 'songs',
        'supports'     => [ 'title', 'custom-fields' ],
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
        'label'        => 'Videos',
        'public'       => true,
        'show_in_rest' => true,
        'rest_base'    => 'videos',
        'supports'     => [ 'title', 'custom-fields' ],
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
        'label'        => 'Members',
        'public'       => true,
        'show_in_rest' => true,
        'rest_base'    => 'band_members',
        'supports'     => [ 'title', 'thumbnail', 'custom-fields' ],
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
