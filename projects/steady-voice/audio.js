/* Steady — Web Audio engine
 * Altered Auditory Feedback: DAF (delay), FAF (pitch shift), MAF (masking noise),
 * AAF (amplification). Plus a metronome for rhythmic / syllable-timed pacing.
 * No external libraries, fully offline. Use WIRED headphones to avoid feedback.
 */

/* ---------- Pitch shifter ("Jungle") for FAF ----------
 * Classic dual-delay-line granular pitch shifter (Chris Rogers / WebAudio sample),
 * implemented with pure Web Audio nodes so it works offline.
 */
(function () {
  var delayTime = 0.1;
  var fadeTime = 0.05;
  var bufferTime = 0.1;

  function createFadeBuffer(context, activeTime, fadeTime) {
    var length1 = activeTime * context.sampleRate;
    var length2 = (activeTime - 2 * fadeTime) * context.sampleRate;
    var length = length1 + length2;
    var buffer = context.createBuffer(1, length, context.sampleRate);
    var p = buffer.getChannelData(0);
    var fadeLength = fadeTime * context.sampleRate;
    var fadeIndex1 = fadeLength;
    var fadeIndex2 = length1 - fadeLength;
    for (var i = 0; i < length1; ++i) {
      var value;
      if (i < fadeIndex1) value = Math.sqrt(i / fadeLength);
      else if (i >= fadeIndex2) value = Math.sqrt(1 - (i - fadeIndex2) / fadeLength);
      else value = 1;
      p[i] = value;
    }
    for (var j = length1; j < length; ++j) p[j] = 0;
    return buffer;
  }

  function createDelayTimeBuffer(context, activeTime, fadeTime, shiftUp) {
    var length1 = activeTime * context.sampleRate;
    var length2 = (activeTime - 2 * fadeTime) * context.sampleRate;
    var length = length1 + length2;
    var buffer = context.createBuffer(1, length, context.sampleRate);
    var p = buffer.getChannelData(0);
    for (var i = 0; i < length1; ++i) {
      if (shiftUp) p[i] = (length1 - i) / length;
      else p[i] = i / length1;
    }
    for (var j = length1; j < length; ++j) p[j] = 0;
    return buffer;
  }

  function Jungle(context) {
    this.context = context;
    var input = context.createGain();
    var output = context.createGain();

    var mod1 = context.createBufferSource();
    var mod2 = context.createBufferSource();
    var mod3 = context.createBufferSource();
    var mod4 = context.createBufferSource();
    var shiftDownBuffer = createDelayTimeBuffer(context, bufferTime, fadeTime, false);
    var shiftUpBuffer = createDelayTimeBuffer(context, bufferTime, fadeTime, true);
    mod1.buffer = shiftDownBuffer;
    mod2.buffer = shiftDownBuffer;
    mod3.buffer = shiftUpBuffer;
    mod4.buffer = shiftUpBuffer;
    mod1.loop = mod2.loop = mod3.loop = mod4.loop = true;

    var mod1Gain = context.createGain();
    var mod2Gain = context.createGain();
    var mod3Gain = context.createGain();
    var mod4Gain = context.createGain();
    mod3Gain.gain.value = 0;
    mod4Gain.gain.value = 0;
    mod1.connect(mod1Gain);
    mod2.connect(mod2Gain);
    mod3.connect(mod3Gain);
    mod4.connect(mod4Gain);

    var modGain1 = context.createGain();
    var modGain2 = context.createGain();
    var delay1 = context.createDelay();
    var delay2 = context.createDelay();
    mod1Gain.connect(modGain1);
    mod2Gain.connect(modGain2);
    mod3Gain.connect(modGain1);
    mod4Gain.connect(modGain2);
    modGain1.connect(delay1.delayTime);
    modGain2.connect(delay2.delayTime);

    var fade1 = context.createBufferSource();
    var fade2 = context.createBufferSource();
    var fadeBuffer = createFadeBuffer(context, bufferTime, fadeTime);
    fade1.buffer = fadeBuffer;
    fade2.buffer = fadeBuffer;
    fade1.loop = true;
    fade2.loop = true;

    var mix1 = context.createGain();
    var mix2 = context.createGain();
    mix1.gain.value = 0;
    mix2.gain.value = 0;
    fade1.connect(mix1.gain);
    fade2.connect(mix2.gain);

    input.connect(delay1);
    input.connect(delay2);
    delay1.connect(mix1);
    delay2.connect(mix2);
    mix1.connect(output);
    mix2.connect(output);

    var t = context.currentTime + 0.05;
    var t2 = t + bufferTime - fadeTime;
    mod1.start(t); mod2.start(t2); mod3.start(t); mod4.start(t2);
    fade1.start(t); fade2.start(t2);

    this.input = input;
    this.output = output;
    this.modGain1 = modGain1;
    this.modGain2 = modGain2;
    this.mod1Gain = mod1Gain;
    this.mod2Gain = mod2Gain;
    this.mod3Gain = mod3Gain;
    this.mod4Gain = mod4Gain;
    this.setPitchOffset(0);
  }

  Jungle.prototype.setDelay = function (d) {
    this.modGain1.gain.setTargetAtTime(0.5 * d, this.context.currentTime, 0.01);
    this.modGain2.gain.setTargetAtTime(0.5 * d, this.context.currentTime, 0.01);
  };

  // mult: -1 (down ~octave) .. +1 (up ~octave). 0 = pass-through.
  Jungle.prototype.setPitchOffset = function (mult) {
    if (mult > 0) {
      this.mod1Gain.gain.value = 0; this.mod2Gain.gain.value = 0;
      this.mod3Gain.gain.value = 1; this.mod4Gain.gain.value = 1;
    } else {
      this.mod1Gain.gain.value = 1; this.mod2Gain.gain.value = 1;
      this.mod3Gain.gain.value = 0; this.mod4Gain.gain.value = 0;
    }
    this.setDelay(delayTime * Math.abs(mult));
  };

  window.Jungle = Jungle;
})();


/* ---------- Altered Auditory Feedback engine ---------- */
window.SteadyAudio = (function () {
  var ctx = null;
  var stream = null;
  var source = null;
  var jungle = null;
  var dafDelay = null;
  var outGain = null;
  var noiseSource = null;
  var noiseGain = null;
  var running = false;

  function makeNoiseBuffer(context) {
    var len = context.sampleRate * 2;
    var buf = context.createBuffer(1, len, context.sampleRate);
    var data = buf.getChannelData(0);
    for (var i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    return buf;
  }

  async function start(opts) {
    if (running) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === "suspended") await ctx.resume();
    stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
    });
    source = ctx.createMediaStreamSource(stream);

    jungle = new window.Jungle(ctx);
    dafDelay = ctx.createDelay(1.0);
    outGain = ctx.createGain();

    source.connect(jungle.input);
    jungle.output.connect(dafDelay);
    dafDelay.connect(outGain);
    outGain.connect(ctx.destination);

    // Masking (MAF)
    noiseSource = ctx.createBufferSource();
    noiseSource.buffer = makeNoiseBuffer(ctx);
    noiseSource.loop = true;
    noiseGain = ctx.createGain();
    noiseGain.gain.value = 0;
    noiseSource.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noiseSource.start();

    running = true;
    apply(opts || {});
  }

  // opts: { delayMs, pitch (-1..1), volume (0..3), masking (0..1) }
  function apply(opts) {
    if (!running) return;
    if (typeof opts.delayMs === "number")
      dafDelay.delayTime.setTargetAtTime(opts.delayMs / 1000, ctx.currentTime, 0.02);
    if (typeof opts.pitch === "number") jungle.setPitchOffset(opts.pitch);
    if (typeof opts.volume === "number")
      outGain.gain.setTargetAtTime(opts.volume, ctx.currentTime, 0.02);
    if (typeof opts.masking === "number")
      noiseGain.gain.setTargetAtTime(opts.masking * 0.25, ctx.currentTime, 0.02);
  }

  function stop() {
    if (!running) return;
    running = false;
    try { noiseSource.stop(); } catch (e) {}
    if (stream) stream.getTracks().forEach(function (t) { t.stop(); });
    if (ctx) ctx.close();
    ctx = stream = source = jungle = dafDelay = outGain = noiseSource = noiseGain = null;
  }

  function isRunning() { return running; }

  return { start: start, apply: apply, stop: stop, isRunning: isRunning };
})();


/* ---------- Metronome (rhythmic / syllable-timed pacing) ---------- */
window.SteadyMetronome = (function () {
  var ctx = null;
  var bpm = 60;
  var running = false;
  var nextNoteTime = 0;
  var timer = null;
  var onBeat = null;
  var beat = 0;
  var accent = true;
  var lookahead = 25; // ms
  var scheduleAhead = 0.12; // s

  function scheduleClick(time, isAccent) {
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.frequency.value = isAccent ? 1000 : 760;
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(isAccent ? 0.5 : 0.32, time + 0.001);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(time);
    osc.stop(time + 0.06);
  }

  function scheduler() {
    while (nextNoteTime < ctx.currentTime + scheduleAhead) {
      var isAccent = accent && beat % 4 === 0;
      scheduleClick(nextNoteTime, isAccent);
      var when = nextNoteTime;
      var b = beat;
      if (onBeat) {
        var delayMs = Math.max(0, (when - ctx.currentTime) * 1000);
        setTimeout(function (bb) { return function () { if (running && onBeat) onBeat(bb); }; }(b), delayMs);
      }
      nextNoteTime += 60.0 / bpm;
      beat++;
    }
  }

  function start(newBpm, cb, useAccent) {
    if (running) stop();
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume();
    bpm = newBpm || 60;
    onBeat = cb || null;
    accent = useAccent !== false;
    beat = 0;
    nextNoteTime = ctx.currentTime + 0.1;
    running = true;
    timer = setInterval(scheduler, lookahead);
  }

  function setBpm(v) { bpm = v; }
  function stop() {
    running = false;
    if (timer) clearInterval(timer);
    timer = null;
    if (ctx) { ctx.close(); ctx = null; }
  }
  function isRunning() { return running; }

  return { start: start, stop: stop, setBpm: setBpm, isRunning: isRunning };
})();
