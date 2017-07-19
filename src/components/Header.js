import React from 'react';
import PropTypes from 'prop-types';
import {merge} from 'lodash';
import {DEFAULT_HEADER_WIDTH, MIN_HEADER_WIDTH} from '../Constants';
import Draggable from './Draggable';

export default class Header extends React.Component {

  static propTypes = {
    width: PropTypes.number,
    title: PropTypes.string
  }

  constructor(props){
    super(props);
    this.headerResizeStopped = this.headerResizeStopped.bind(this);
    this.RESIZE_MODES = {RESIZING: "resizing", STILL: "still"};
    this.state = {
      resizeMode: this.RESIZE_MODES.STILL,
      left: this.props.width * 0.9,
      previousPos: 0,
      width: this.props.width
    };
  }

  headerResizing(pos){
    let {left, previousPos, width} = this.state
    let newLeft = left;
    if(pos.x > previousPos) newLeft += 1;
    else if(pos.x < previousPos) newLeft -= 1;
    let newWidth = parseInt(this.resizeHandler.style.left);
    if(newWidth < width) width = Math.max(newWidth, MIN_HEADER_WIDTH); 
    this.setState({
      resizeMode: this.RESIZE_MODES.RESIZING, 
      left: newLeft,
      previousPos: pos.x,
      width: newWidth
    });
  }

  headerResizeStopped(e){
    console.log("resize stopped");
  }

  resizeStyle(){
    let resizeStyle = {left: this.state.left};
    switch(this.state.resizeMode){
      case this.RESIZE_MODES.STILL:
        return merge(styles.resize_still, resizeStyle);
      case this.RESIZE_MODES.RESIZING:
        return merge(styles.resize_resizing, resizeStyle);
    }
  }

  render(){
    let style = {width: this.state.width};
    style = merge(style, styles.header);
    return (
      <th style={style}>
        {this.props.title}
        <Draggable onMove={pos => this.headerResizing(pos)}>
          <div 
            ref={resizeHandler => { this.resizeHandler = resizeHandler}}
            className="resize" 
            style={this.resizeStyle()}></div>
        </Draggable>
      </th>
    );
  }
}

const styles = {
  header: {
    borderLeft: "1px solid #BDBDBD",
    borderRight: "1px solid #BDBDBD",
    fontSize: 12,
    fontWeight: 500,
    position: "relative"
  },
  resize_still: {
    height: 20,
    cursor: "col-resize",
    width: 5,
    position: "absolute",
    top: 0
  },
  resize_resizing: {
    height: 600,
    cursor: "col-resize",
    width: 1,
    position: "absolute",
    top: 0,
    background: "#2196F3"
  }
}