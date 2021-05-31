// rollup.config.js
import babel from 'rollup-plugin-babel';

export default {
  input: 'example/main.render.js', // 入口文件
  strict: false,
  output: {
    format: 'cjs',
    file: 'example/main.render.dist.js', // 打包后输出文件
  },
  plugins: [
    babel({
      exclude: "node_modules/**"
    }),
  ]
}