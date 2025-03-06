module.exports = {
  // ... otras configuraciones que puedas tener
  
  resolve: {
    fallback: {
      "crypto": require.resolve("crypto-browserify"),
      "buffer": require.resolve("buffer/"),
      "stream": require.resolve("stream-browserify")
    }
  }
};