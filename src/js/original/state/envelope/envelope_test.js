goog.provide('audioCat.state.envelope.EnvelopeTest');

goog.require('audioCat.state.envelope.Envelope');
goog.require('audioCat.utility.IdGenerator');
goog.require('goog.testing.jsunit');

/**
 * @type {string}
 */
var defaultEnvelopeName = 'defaultEnvelope';

/** @type {audioCat.state.envelope.Envelope} */
var defaultEnvelope;

/** @type {audioCat.utility.IdGenerator} */
var idGenerator;

var setUp = function() {
  idGenerator = new audioCat.utility.IdGenerator();
  defaultEnvelope = new audioCat.state.envelope.Envelope(
    idGenerator, defaultEnvelopeName, 1, 0, 2);
};

var testGetName = function() {
  assertEquals(defaultEnvelopeName, defaultEnvelope.getName());
};

var testAddControlPoint = function() {
  assertEquals(0, defaultEnvelope.getNumberOfControlPoints());

  var controlPoint1 = defaultEnvelope.createControlPoint(1, 1);
  defaultEnvelope.addControlPoint(controlPoint1);
  assertEquals(1, defaultEnvelope.getNumberOfControlPoints());

  var controlPoint2 = defaultEnvelope.createControlPoint(0.5, 1);
  defaultEnvelope.addControlPoint(controlPoint2);

  var controlPoint3 = defaultEnvelope.createControlPoint(1.5, 1);
  defaultEnvelope.addControlPoint(controlPoint3);

  var controlPoint4 = defaultEnvelope.createControlPoint(0.25, 1);
  defaultEnvelope.addControlPoint(controlPoint4);

  // Ensure that the points are properly ordered.
  assertEquals(controlPoint4.getId(),
      defaultEnvelope.getControlPointAtIndex(0).getId());
  assertEquals(controlPoint2.getId(),
      defaultEnvelope.getControlPointAtIndex(1).getId());
  assertEquals(controlPoint1.getId(),
      defaultEnvelope.getControlPointAtIndex(2).getId());
  assertEquals(controlPoint3.getId(),
      defaultEnvelope.getControlPointAtIndex(3).getId());
};

var testObtainLowerBound = function() {
  // No control points. No lower bound.
  assertEquals(-1, defaultEnvelope.obtainLowerBound(1));

  // Now add a control point.
  defaultEnvelope.addControlPoint(defaultEnvelope.createControlPoint(1, 1));
  assertEquals(-1, defaultEnvelope.obtainLowerBound(0.99));
  assertEquals(0, defaultEnvelope.obtainLowerBound(1));
  assertEquals(0, defaultEnvelope.obtainLowerBound(1.01));

  // Add some more control points.
  defaultEnvelope.addControlPoint(defaultEnvelope.createControlPoint(0.5, 1));
  defaultEnvelope.addControlPoint(defaultEnvelope.createControlPoint(0.5, 1));
  defaultEnvelope.addControlPoint(defaultEnvelope.createControlPoint(1.5, 1));
  assertEquals(1, defaultEnvelope.obtainLowerBound(0.51));
  assertEquals(2, defaultEnvelope.obtainLowerBound(1.1));
  assertEquals(3, defaultEnvelope.obtainLowerBound(1.5));
  assertEquals(3, defaultEnvelope.obtainLowerBound(1.6));
};

var testObtainUpperBound = function() {
  // No control points. No upper bound.
  assertEquals(-1, defaultEnvelope.obtainLowerBound(1.0));

  // Now, add a control point.
  defaultEnvelope.addControlPoint(defaultEnvelope.createControlPoint(1, 1));
  assertEquals(-1, defaultEnvelope.obtainLowerBound(0.99));
  assertEquals(0, defaultEnvelope.obtainLowerBound(1));
  assertEquals(0, defaultEnvelope.obtainLowerBound(1.01));

  // Add some more control points. We then have times 0.5, 1, 1, 1.5.
  defaultEnvelope.addControlPoint(defaultEnvelope.createControlPoint(1, 1));
  defaultEnvelope.addControlPoint(defaultEnvelope.createControlPoint(0.5, 1));
  defaultEnvelope.addControlPoint(defaultEnvelope.createControlPoint(1.5, 1));
  assertEquals(-1, defaultEnvelope.obtainLowerBound(0.49));
  assertEquals(0, defaultEnvelope.obtainLowerBound(0.5));
  assertEquals(0, defaultEnvelope.obtainLowerBound(0.99));
  assertEquals(2, defaultEnvelope.obtainLowerBound(1));
  assertEquals(2, defaultEnvelope.obtainLowerBound(1.49));
  assertEquals(3, defaultEnvelope.obtainLowerBound(1.5));
};

var testModifyControlPoint = function() {
  // Create control points with times 0.5, 1, 1, 1.5.
  var controlPoint1 = defaultEnvelope.createControlPoint(1, 1);
  defaultEnvelope.addControlPoint(controlPoint1);

  var controlPoint2 = defaultEnvelope.createControlPoint(1, 1);
  defaultEnvelope.addControlPoint(controlPoint2);

  var controlPoint3 = defaultEnvelope.createControlPoint(0.5, 1);
  defaultEnvelope.addControlPoint(controlPoint3);

  var controlPoint4 = defaultEnvelope.createControlPoint(1.5, 1);
  defaultEnvelope.addControlPoint(controlPoint4);

  assertEquals(controlPoint3.getId(),
      defaultEnvelope.getControlPointAtIndex(0).getId());
  controlPoint4.set(0.25, 1);
  assertEquals(controlPoint4.getId(),
      defaultEnvelope.getControlPointAtIndex(0).getId());
  assertEquals(controlPoint3.getId(),
      defaultEnvelope.getControlPointAtIndex(1).getId());
  controlPoint4.set(1, 1);
  assertEquals(controlPoint3.getId(),
      defaultEnvelope.getControlPointAtIndex(0).getId());

  controlPoint3.set(1.5);
  assertEquals(controlPoint3.getId(),
      defaultEnvelope.getControlPointAtIndex(3).getId());
};

var tearDown = function() {
  return;
};
