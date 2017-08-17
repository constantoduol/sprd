import React from 'react';

import Sprd from './Sprd';
import Actions from './Actions';
import Store from './Store';
import {DEFAULT_HEADER_WIDTH, DEFAULT_ROW_HEIGHT} from './Constants'; 

export default class SprdContainer extends React.Component {

  static defaultProps = {
    data: null, //data is in format {header1: [value1, value2], header2: [value3, value4]}
    showHeaderLetters: true, //show the letters at top A, B, C ... AA, AB
    showRowNumbers: true,
    showFormulaBar: true,
    infinite: true, //scroll infinitely in any directions
    showFooter: true,
    width: 900,
    height: 500,
    cols: 10,
    rows: 20
  };

  componentDidMount(){
    let {width, height, cols, rows} = this.props;
    Actions.setViewPort(rows, cols);
    Actions.parseData(this.props.data, rows, cols);
  }

  render(){
    return (
      <Sprd {...this.props}/>
    )
  }
}