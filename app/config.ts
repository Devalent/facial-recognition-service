export default {
  use_test_data: !!process.env.STANDALONE,
  recognition_threshold: 0.6,
  recognition_fps: 1.0,
  video_width: 640,
  video_height: 480,
} as const;
