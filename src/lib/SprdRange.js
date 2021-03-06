import {toExcelColName} from './Util';
import {UNKNOWN, OUT_OF_RANGE_CELL} from './Constants';
//renamed from Range to distinguish from window.Range
export default class SprdRange {

  constructor(startRow, startCol, stopRow, stopCol){
    this.startRow = startRow;
    this.startCol = startCol;
    this.stopRow = stopRow;
    this.stopCol = stopCol;
  }

  /**
  * range - the current cell range
  */
  isNumberCellSelected(range){
    let {startRow} = range;
    return this.startCol === 0 && this.stopCol === UNKNOWN && this.startRow === startRow;
  }

  getAddress(){
    //returns address in the form of column letter,row num e.g A6, A19:D29
    let {startCol, startRow, stopRow, stopCol} = this;
    let startColLetter = toExcelColName(startCol + 1);
    
    if(startRow === stopRow && startCol === stopCol){ //single cell
      return `${startColLetter}${startRow + 1}`
    } else if(startRow === 0 && stopRow === UNKNOWN){ //column selected
      return `${startColLetter}:${startColLetter}`;
    } else if(startCol === 0 && stopCol === UNKNOWN){//row selected
      return `${startRow + 1}:${startRow + 1}`;
    }
    return `${startColLetter}${startRow + 1}:${toExcelColName(stopCol + 1)}${stopRow + 1}`; //arbitrary range
  }

  isOutOfRangeCell(){
    let {startCol, startRow, stopRow, stopCol} = this;
    return startCol < 0 && startRow < 0 && stopCol < 0 && stopRow < 0;
  }

  /**
  * range - the current cell range
  */
  isCellSelected(range){
    let {startCol, startRow, stopRow, stopCol} = range;
    return this.startRow === startRow && this.startCol === startCol && this.stopRow === stopRow && this.stopCol === stopCol;
  }

  static isEntireGridSelected(range){
    let {startCol, startRow, stopRow, stopCol} = range;
    return startCol === 0 && startRow === 0 && stopRow === UNKNOWN && stopCol === UNKNOWN;
  }

  /**
  * range - the current cell range
  */
  isHeaderSelected(range){
    let {startCol} = range;
    return this.startCol === startCol && this.stopCol === startCol && this.startRow === 0 && this.stopRow === UNKNOWN;
  }

  isEqual(otherRange){
    return this.toString() === otherRange.toString();
  }

  //verify whether a list of two ranges is the same
  static areEqual(ranges1, ranges2){
    if(ranges1.length !== ranges2.length) return false;
    let allFound = true;
    let skip = {}; //we've already found these, skip them

    for(let x = 0; x < ranges1.length; x++){
      let range1 = ranges1[x];
      let oneFound = false;

      for(let y = 0; y < ranges2.length; y++){
        let range2 = ranges2[y];
        if(range1.isEqual(range2) && !skip[y]) {
          oneFound = true;
          skip[y] = true;
          break;
        }
      }
    
      allFound = allFound && oneFound; 
      if(!allFound) break;
    }
    return allFound;
  }

  //get a specific sprd range from the ranges immutable
  static fromImmutable(key, ranges){
    ranges = ranges.toJS();
    if(!key) return ranges 
    return ranges[key];
  }

  toString(){
    let {startCol, stopCol, startRow, stopRow} = this;
    if(startCol === stopCol && startRow === stopRow)
      return `${startRow}_${startCol}`;
    return `${startRow}_${startCol}_${stopRow}_${stopCol}`;
  }

  /**
  * finds one range that covers all the ranges
  * @ranges - an array of SprdRange objects
  */
  static toSingleRange(ranges){
    let minRow = Number.MAX_SAFE_INTEGER, minCol = Number.MAX_SAFE_INTEGER, maxRow = 0, maxCol = 0;
    let validRangeFound = false;

    for(let range of ranges){
      if(!range || range.isOutOfRangeCell()) {
        continue;
      }

      validRangeFound = true

      let {startCol, stopCol, startRow, stopRow} = range;
      if(startCol < minCol) minCol = startCol;
      if(stopCol > maxCol) maxCol = stopCol;

      if(startRow < minRow) minRow = startRow;
      if(stopRow > maxRow) maxRow = stopRow;
    }

    if(!validRangeFound) return OUT_OF_RANGE_CELL;

    return new SprdRange(minRow, minCol, maxRow, maxCol);
  }

  /**
  * returns a range with the drag origin as the extremity
  * @ranges - an array consisting of sprd ranges representing the area covered by the drag
  * @dragOrigin - the SprdRange representing the cell where dragging started
  * @recentDragCell - a SprdRange representing the most recent cell covered by dragging, this helps determine the direction
  *                  of drag relative to the drag origin
  */
  static toDragRange(ranges, dragOrigin, recentDragCell){
    let {startCol: originStartCol, stopCol: originStopCol, startRow: originStartRow, stopRow: originStopRow} = dragOrigin;
    let {startCol: recentStartCol, stopCol: recentStopCol, startRow: recentStartRow, stopRow: recentStopRow} = recentDragCell;
    let singleRange = SprdRange.toSingleRange(ranges);

    if(recentStartCol <= originStartCol && recentStartRow >= originStartRow){
      //direction = DIRECTION.BOTTOM_LEFT;
      singleRange.stopCol = originStopCol;
      singleRange.startRow = originStartRow;
      singleRange.startCol = recentStartCol;
      singleRange.stopRow = recentStopRow;
    } else if(recentStartCol <= originStartCol && recentStartRow <= originStartRow){
      //direction = DIRECTION.TOP_LEFT;
      singleRange.stopRow = originStopRow;
      singleRange.stopCol = originStopCol;
      singleRange.startCol = recentStartCol;
      singleRange.startRow = recentStartRow;
    } else if(recentStartCol >= originStartCol && recentStartRow <= originStartRow){
      //direction = DIRECTION.TOP_RIGHT;
      singleRange.startCol = originStartCol;
      singleRange.stopRow = originStopRow;
      singleRange.startRow = recentStartRow;
      singleRange.stopCol = recentStopCol;
    } else if(recentStartCol >= originStartCol && recentStartRow >= originStartRow){
      //direction = DIRECTION.BOTTOM_RIGHT;
      singleRange.startCol = originStartCol;
      singleRange.startRow = originStartRow;
      singleRange.stopRow = recentStopRow;
      singleRange.stopCol = recentStopCol;
    }

    return singleRange;
  }

  /**
  * verifies whether the current cell is within the given range
  */
  isWithinRange(range){
    let {startRow, startCol, stopRow, stopCol} = range;
    return this.startRow >= startRow && this.stopRow <= stopRow && this.startCol >= startCol && this.stopCol <= stopCol;
  }

}