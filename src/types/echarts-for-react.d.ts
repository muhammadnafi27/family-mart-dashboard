declare module 'echarts-for-react' {
  import type { CSSProperties } from 'react'
  import { Component } from 'react'

  interface ReactEChartsProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    option: Record<string, any>
    style?: CSSProperties
    className?: string
    theme?: string | object
    notMerge?: boolean
    lazyUpdate?: boolean
    onEvents?: Record<string, (params: unknown, chart: unknown) => void>
  }

  export default class ReactECharts extends Component<ReactEChartsProps> {}
}
