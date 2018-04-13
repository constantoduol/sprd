import React from 'react';
import {merge, difference} from 'lodash';
import Mousetrap from 'mousetrap';
import connectToStores from 'alt-utils/lib/connectToStores';

import Footer from './components/Footer';
import HeaderContainer from './components/HeaderContainer';
import CellContainer from './components/CellContainer';
import Actions from './Actions';
import SprdRange from './SprdRange';
import Store from './Store';
import SprdNavigator from './SprdNavigator';
import {DIRECTION} from './Constants';

@connectToStores
export default class Sprd extends React.Component {

  constructor(props){
    super(props);
    this.keyDown = this.keyDown.bind(this);
    this.KEY_DOWN_IGNORE_KEYS = {
      enter: "enter", 
      arrowleft: "arrowleft", 
      arrowdown: "arrowdown", 
      arrowright: "arrowright",
      arrowup: "arrowup",
      alt: "alt",
      control: "control",
      shift: "shift"
    };
  }

  static getStores() {
    return [Store];
  }

  static getPropsFromStores() {
    return Store.getState();
  }

  componentDidMount(){
    this.setupKeyBindings();
    this.container.addEventListener('paste', this.handlePaste.bind(this));
  }


  shouldComponentUpdate(nextProps, nextState){
    //there was a change in the ranges
    let rangesChanged = SprdRange.areEqual(Object.values(nextProps.ranges.toJS()), Object.values(this.props.ranges.toJS()));
    if(!rangesChanged) return true;
    //there was a change in data
    if(nextProps.data !== this.props.data) return true;
    if(nextProps.dragging !== this.props.dragging) return true; //dragging is going on
    //there was a change in header widths
    return difference(nextProps.headerWidths, this.props.headerWidths).length > 0;
  }

  keyDown(e){
    let key = e.key.toLowerCase();
    let clickSelectedRange = SprdRange.fromImmutable('clickSelectedRange', this.props.ranges);
    if(key !== "enter"){
      Actions.setRange({'focusedCellRange': clickSelectedRange});
    }
  }

  setupKeyBindings(){
    Mousetrap.bind("mod+c", () => {
      console.log("copy", this);
    });

    Mousetrap.bind("up", () => {
      SprdNavigator.move(this.props, DIRECTION.UP);
    });

    Mousetrap.bind("down", () => {
      SprdNavigator.move(this.props, DIRECTION.DOWN);
    });

    Mousetrap.bind("right", () => {
      SprdNavigator.move(this.props, DIRECTION.RIGHT);
    });

    Mousetrap.bind("left", () => {
      SprdNavigator.move(this.props, DIRECTION.LEFT);
    });

    Mousetrap.bind("enter", () => {
      let clickSelectedRange = SprdRange.fromImmutable('clickSelectedRange', this.props.ranges);
      Actions.setRange({'focusedCellRange': clickSelectedRange});
    });

    document.onkeydown = (e) => {
      let key = e.key.toLowerCase();
      let clickSelectedRange = SprdRange.fromImmutable('clickSelectedRange', this.props.ranges);
      if(!this.KEY_DOWN_IGNORE_KEYS[key]){
        Actions.setRange({'focusedCellRange': clickSelectedRange});
      }
    }

  }

  handlePaste (e) {
    let clipboardData, pastedData;

    // Stop data actually being pasted into div
    e.stopPropagation();
    e.preventDefault();

    // Get pasted data via clipboard API
    clipboardData = e.clipboardData || window.clipboardData;
    pastedData = clipboardData.getData('Text');

    let lines = pastedData.split(/\r?\n/);
    let {ranges, data} = this.props;
    let clickSelectedRange = SprdRange.fromImmutable('clickSelectedRange', ranges);
    let {startRow, stopRow, startCol, stopCol} = clickSelectedRange;
    let originalStartCol = startCol;
    let highligtedRange = new SprdRange(startRow, startCol, stopRow, stopCol);
    let maxTokenLength = 0;

    for(let line of lines){
      let tokens = line.split(/\t?\s/);
      maxTokenLength = Math.max(maxTokenLength, tokens.length);
      if(!data.get(startRow)) data = data.set(startRow, Map({}));
      for(let token of tokens){
        if(token) data = data.setIn([startRow, startCol], token);
        startCol++;
      }
      startRow++;
      startCol = originalStartCol;
    }

    highligtedRange.stopRow = startRow;
    highligtedRange.stopCol = startCol + maxTokenLength - 1;
    ranges = ranges.set('dragSelectedRange', highligtedRange);
    Actions.setState({data: data, ranges: ranges});
  }

  render(){
    let {
      cols, rows, headerWidths, ranges, showHeaderLetters, data, width, 
      minRow, minCol, dragging, infiniteScroll} = this.props;
    let style = merge(styles.root, {width});
    return (
      <div style={style} draggable="false" ref={container => this.container = container}>
        <table style={styles.table}>
          <HeaderContainer
            cols={cols}
            headerWidths={headerWidths}
            ranges={ranges}
            minCol={minCol}
            showHeaderLetters={showHeaderLetters}/>
          <CellContainer 
            cols={cols} 
            minCol={minCol}
            minRow={minRow}
            data={data}
            infiniteScroll={infiniteScroll}
            ranges={ranges}
            dragging={dragging}
            rows={rows}/>
        </table>
        <Footer width={width}/>
      </div>
    )
  }
}

const styles = {
  table: {
    borderCollapse: "collapse",
    borderSpacing: 0,
    userSelect: "none"
  },
  root: {
    borderBottom: "1px solid #BDBDBD",
    borderRight: "1px solid #BDBDBD",
    margin: 5,
    userSelect: "none",
    position: "fixed"
  }
}