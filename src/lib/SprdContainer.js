import React from 'react';

import Sprd from './Sprd';
import Actions from './Actions';
import {DEFAULT_HEADER_WIDTH, DEFAULT_ROW_HEIGHT} from './Constants'; 

export default class SprdContainer extends React.Component {

  static defaultProps = {
    data: null, //data is in format [['Name', 'Age'], ['sam', 20], ['Mike', 30], ['Greg', 40]]
    showHeaderLetters: true, //show the letters at top A, B, C ... AA, AB
    showFooter: true,
    infiniteScroll: true, //scroll infinitely in any direction
    onEvent: null, //function called when an event occurs
    cellOverride: null, //function called to selectively render some cells differently
    width: 1000,
    height: 800
  };

  componentDidMount(){
    let {width, height} = this.props;
    let cols = parseInt(width/DEFAULT_HEADER_WIDTH, 10);
    let rows = parseInt(height/DEFAULT_ROW_HEIGHT, 10) - 2; //-2 for header and footer
    Actions.parseData(this.props.data, rows, cols);
  }

  render(){
    return (
      <Sprd {...this.props}/>
    )
  }
}