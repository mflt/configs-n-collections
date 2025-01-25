import {
  _feIsNumber
} from './probes.js';


export const _feDelay = (
  milliseconds: number,
) => new Promise(_ => setTimeout(_,_feIsNumber(milliseconds)? milliseconds : 0));

export function _feDelaySync (
  milliseconds: number,
) {
  (async () => await _feDelay(milliseconds))();
  return;
}