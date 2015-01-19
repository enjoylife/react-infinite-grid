var React = require('react');
var Item = require('./item');

var Grid = React.createClass({

    propTypes: {
        entries: React.PropTypes.arrayOf(React.PropTypes.element).isRequired,
        height: React.PropTypes.number,
        width: React.PropTypes.number,
        padding: React.PropTypes.number,
        wrapperHeight: React.PropTypes.number,
    },

    getDefaultProps: function() {
        return {
            padding: 10,
            entries: [],
            height: 250,
            width: 250,
        };
    },

    getInitialState: function() {
        return {
            selectMode: false,
            minHeight: window.innerHeight * 2,
            visibleIndexes: {
                lower: 0,
                higher: 100,
            },
            itemDimensions: {
                height: this._itemHeight(),
                width: this._itemHeight(),
                gridWidth: 0,
                itemsPerRow: 2,
            },
        };
    },

    // METHODS

    _wrapperStyle: function() {
        return {
            maxHeight: window.innerHeight,
            overflowY: 'scroll',
            height: this.props.wrapperHeight,
        };
    },

    _gridStyle: function() {
        return {
            position: "relative",
            marginTop: this.props.padding,
            marginLeft: this.props.padding,
            minHeight: this.state.minHeight,
        };
    },

    _getGridRect: function() {
        return this.refs.grid.getDOMNode().getBoundingClientRect();
    },

    _getWrapperRect: function() {
        return this.refs.wrapper.getDOMNode().getBoundingClientRect();
    },

    _visibleIndexes: function() {
        var itemsPerRow = this._itemsPerRow();

        // The number of rows that the user has scrolled past
        var scrolledPast = (this._scrolledPastRows() * itemsPerRow);
        if (scrolledPast < 0) scrolledPast = 0;

        // If i have scrolled past 20 items, but 60 are visible on screen,
        // we do not want to change the minimum
        var min = scrolledPast - itemsPerRow;
        if (min < 0) min = 0;

        // the maximum should be the number of items scrolled past, plus some
        // buffer
        var bufferRows = this._numVisibleRows() + 2;
        var max = scrolledPast + (itemsPerRow * bufferRows);

        this.setState({
            visibleIndexes: {
                lower: min,
                higher: max,
            },
            itemDimensions: {
                height: this._itemHeight(),
                width: this._itemHeight(),
                gridWidth: this._getGridRect().width,
                itemsPerRow: itemsPerRow,
            },
            minHeight: this._totalRows(),
        });
    },

    _itemsPerRow: function() {
        return Math.floor(this._getGridRect().width / this._itemWidth());
    },

    _totalRows: function() {
        var scrolledPastHeight = (this.props.entries.length / this._itemsPerRow()) * this._itemHeight();
        if (scrolledPastHeight < 0) return 0;
        return scrolledPastHeight;
    },

    _scrolledPastRows: function() {
        var rect = this._getGridRect();
        var topScrollOffset = rect.height - rect.bottom;
        return Math.floor(topScrollOffset / this._itemHeight());
    },

    _itemHeight: function() {
        return this.props.height + (2 * this.props.padding);
    },

    _itemWidth: function() {
        return this.props.width + (2 * this.props.padding);
    },

    // The number of visible rows in the grid
    _numVisibleRows: function() {
        return Math.ceil(this._getWrapperRect().height / this._itemHeight());
    },

    // LIFECYCLE

    componentWillMount: function() {
        window.addEventListener('resize', this._resizeListener);
    },

    componentDidMount: function() {
        this._visibleIndexes();
    },

    componentWillUnmount: function() {
        window.removeEventListener('resize', this._resizeListener);
    },

    // LISTENERS

    _scrollListener: function(event) {
        this._visibleIndexes();
    },

    _resizeListener: function(event) {
        this._visibleIndexes();
    },

    // RENDER

    render: function() {

        var entries = [];
        if (this.props.entries.length > 0) {
            for (var i = this.state.visibleIndexes.lower; i <= this.state.visibleIndexes.higher; i++) {
                var entry = this.props.entries[i];
                if (entry) {
                    entries.push(React.createElement(Item, {
                        key: "item-" + i,
                        index: i,
                        padding: this.props.padding,
                        dimensions: this.state.itemDimensions,
                    }, entry));
                }
            }
        }

        return(
            <div ref="wrapper" className="infinite-grid-wrapper" onScroll={this._scrollListener} style={this._wrapperStyle()}>
                <div ref="grid" className="infinite-grid" style={this._gridStyle()}>
                    {entries}
                </div>
            </div>
        );
    },
});

module.exports = Grid;
