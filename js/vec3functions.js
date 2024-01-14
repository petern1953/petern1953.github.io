/**
* Common utilities
* @module glMatrix
*/
// Configuration Constants
var EPSILON = 0.000001;
var ARRAY_TYPE = Array;
var RANDOM = Math.random;
/**
 * Sets the type of array used when creating new vectors and matrices
 *
 * @param {Float32ArrayConstructor | ArrayConstructor} type Array type, such as Float32Array or Array
 */

var vec3 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  create: create$4,
  clone: clone$4,
  length: length,
  fromValues: fromValues$4,
  copy: copy$4,
  // set: set$4,
  add: add$4,
  subtract: subtract$4,
  // multiply: multiply$4,
  // divide: divide,
  // ceil: ceil,
  // floor: floor,
  // min: min,
  // max: max,
  // round: round,
  // scale: scale$4,
  // scaleAndAdd: scaleAndAdd,
  // distance: distance,
  // squaredDistance: squaredDistance,
  // squaredLength: squaredLength,
  // negate: negate,
  // inverse: inverse,
  // normalize: normalize,
  // dot: dot,
  // cross: cross,
  // lerp: lerp,
  // hermite: hermite,
  // bezier: bezier,
  // random: random,
  // transformMat4: transformMat4,
  // transformMat3: transformMat3,
  // transformQuat: transformQuat,
  rotateX: rotateX$1,
  rotateY: rotateY$1,
  rotateZ: rotateZ$1
  // angle: angle,
  // zero: zero,
  // str: str$4,
  // exactEquals: exactEquals$4,
  // equals: equals$5,
  // sub: sub$4,
  // mul: mul$4,
  // div: div,
  // dist: dist,
  // sqrDist: sqrDist,
  // len: len,
  // sqrLen: sqrLen,
  // forEach: forEach
});

/**
* Creates a new, empty vec3
*
* @returns {vec3} a new 3D vector
*/

function create$4() {
  var out = new ARRAY_TYPE(3);

  if (ARRAY_TYPE != Float32Array) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
  }

  return out;
}

/**
* Creates a new vec3 initialized with values from an existing vector
*
* @param {ReadonlyVec3} a vector to clone
* @returns {vec3} a new 3D vector
*/

function clone$4(a) {
  var out = new ARRAY_TYPE(3);
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  return out;
}

/**
* Calculates the length of a vec3
*
* @param {ReadonlyVec3} a vector to calculate length of
* @returns {Number} length of a
*/

function length(a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  return Math.hypot(x, y, z);
}

function fromValues$4(x, y, z) {
  var out = new ARRAY_TYPE(3);
  out[0] = x;
  out[1] = y;
  out[2] = z;
  return out;
}

/**
* Copy the values from one vec3 to another
*
* @param {vec3} out the receiving vector
* @param {ReadonlyVec3} a the source vector
* @returns {vec3} out
*/

function copy$4(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  return out;
}

  /**
   * Adds two vec3's
   *
   * @param {vec3} out the receiving vector
   * @param {ReadonlyVec3} a the first operand
   * @param {ReadonlyVec3} b the second operand
   * @returns {vec3} out
   */

  function add$4(out, a, b) {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    out[2] = a[2] + b[2];
    return out;
  }
  
  /**
   * Subtracts vector b from vector a
   *
   * @param {vec3} out the receiving vector
   * @param {ReadonlyVec3} a the first operand
   * @param {ReadonlyVec3} b the second operand
   * @returns {vec3} out
   */

  function subtract$4(out, a, b) {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    out[2] = a[2] - b[2];
    return out;
  }

/**
* Set the components of a vec3 to the given values
*
* @param {vec3} out the receiving vector
* @param {Number} x X component
* @param {Number} y Y component
* @param {Number} z Z component
* @returns {vec3} out
*/

function set$4(out, x, y, z) {
  out[0] = x;
  out[1] = y;
  out[2] = z;
  return out;
}

/**
* Rotate a 3D vector around the x-axis
* @param {vec3} out The receiving vec3
* @param {ReadonlyVec3} a The vec3 point to rotate
* @param {ReadonlyVec3} b The origin of the rotation
* @param {Number} rad The angle of rotation in radians
* @returns {vec3} out
*/

function rotateX$1(out, a, b, rad) {
  var p = [],
    r = []; //Translate point to the origin

  p[0] = a[0] - b[0];
  p[1] = a[1] - b[1];
  p[2] = a[2] - b[2]; //perform rotation

  r[0] = p[0];
  r[1] = p[1] * Math.cos(rad) - p[2] * Math.sin(rad);
  r[2] = p[1] * Math.sin(rad) + p[2] * Math.cos(rad); //translate to correct position

  out[0] = r[0] + b[0];
  out[1] = r[1] + b[1];
  out[2] = r[2] + b[2];
  return out;
}

/**
 * Rotate a 3D vector around the y-axis
 * @param {vec3} out The receiving vec3
 * @param {ReadonlyVec3} a The vec3 point to rotate
 * @param {ReadonlyVec3} b The origin of the rotation
 * @param {Number} rad The angle of rotation in radians
 * @returns {vec3} out
 */

function rotateY$1(out, a, b, rad) {
  var p = [],
    r = []; //Translate point to the origin

  p[0] = a[0] - b[0];
  p[1] = a[1] - b[1];
  p[2] = a[2] - b[2]; //perform rotation

  r[0] = p[2] * Math.sin(rad) + p[0] * Math.cos(rad);
  r[1] = p[1];
  r[2] = p[2] * Math.cos(rad) - p[0] * Math.sin(rad); //translate to correct position

  out[0] = r[0] + b[0];
  out[1] = r[1] + b[1];
  out[2] = r[2] + b[2];
  return out;
}
/**
 * Rotate a 3D vector around the z-axis
 * @param {vec3} out The receiving vec3
 * @param {ReadonlyVec3} a The vec3 point to rotate
 * @param {ReadonlyVec3} b The origin of the rotation
 * @param {Number} rad The angle of rotation in radians
 * @returns {vec3} out
 */

function rotateZ$1(out, a, b, rad) {
  var p = [],
    r = []; //Translate point to the origin

  p[0] = a[0] - b[0];
  p[1] = a[1] - b[1];
  p[2] = a[2] - b[2]; //perform rotation

  r[0] = p[0] * Math.cos(rad) - p[1] * Math.sin(rad);
  r[1] = p[0] * Math.sin(rad) + p[1] * Math.cos(rad);
  r[2] = p[2]; //translate to correct position

  out[0] = r[0] + b[0];
  out[1] = r[1] + b[1];
  out[2] = r[2] + b[2];
  return out;
}