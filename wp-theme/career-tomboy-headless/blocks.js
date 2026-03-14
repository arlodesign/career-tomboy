/* global wp */
wp.blocks.registerBlockType('career-tomboy/song-list', {
    title: 'Song List',
    icon: 'playlist-audio',
    category: 'text',
    edit: function () {
        return wp.element.createElement(
            'div',
            {
                style: {
                    padding: '16px 20px',
                    background: '#f6f7f7',
                    border: '1px solid #c3c4c7',
                    borderLeft: '4px solid #1d2327',
                    borderRadius: '2px',
                    fontFamily: 'sans-serif',
                },
            },
            wp.element.createElement('strong', { style: { fontSize: '13px' } }, 'Song List'),
            wp.element.createElement(
                'p',
                { style: { margin: '4px 0 0', fontSize: '12px', color: '#50575e' } },
                'The full song list will appear here on careertomboy.com. Drag this block to reposition it.',
            ),
        );
    },
    save: function () {
        return null;
    },
});
