import { onUnmounted, ref } from 'vue'

declare global {
  interface Window {
    TMap: any
  }
}

const TENCENT_MAP_KEY = import.meta.env.VITE_TENCENT_MAP_KEY || ''

let sdkLoadingPromise: Promise<void> | null = null

/** 动态加载腾讯地图 JS SDK */
function loadTencentMapSDK(): Promise<void> {
  if (window.TMap) return Promise.resolve()
  if (sdkLoadingPromise) return sdkLoadingPromise

  if (!TENCENT_MAP_KEY) {
    return Promise.reject(new Error('未配置 VITE_TENCENT_MAP_KEY'))
  }

  sdkLoadingPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `https://map.qq.com/api/gljs?v=1.exp&key=${TENCENT_MAP_KEY}`
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('腾讯地图 SDK 加载失败'))
    document.head.appendChild(script)
  })

  return sdkLoadingPromise
}

/**
 * 在指定容器中渲染腾讯地图，并在经纬度处添加标记点。
 * 返回销毁函数，组件卸载时需调用以释放地图实例。
 */
export function useTencentMap() {
  const mapInstance = ref<any>(null)
  const markerInstance = ref<any>(null)
  const error = ref<string>('')

  async function initMap(
    containerId: string,
    lat: number | undefined,
    lng: number | undefined,
  ) {
    if (!lat || !lng) {
      error.value = '暂无坐标数据'
      return
    }

    try {
      await loadTencentMapSDK()

      // 定义中心点坐标（经度在前）
      const center = new window.TMap.LatLng(lat, lng)

      mapInstance.value = new window.TMap.Map(containerId, {
        center,
        zoom: 16,
        viewMode: '2D',
      })

      // 添加标记
      markerInstance.value = new window.TMap.MultiMarker({
        map: mapInstance.value,
        styles: {
          marker: new window.TMap.MarkerStyle({
            width: 24,
            height: 36,
            anchor: { x: 12, y: 36 },
          }),
        },
        geometries: [
          {
            id: 'company',
            position: center,
          },
        ],
      })
    } catch (e: any) {
      error.value = e.message || '地图加载失败'
    }
  }

  function destroyMap() {
    if (markerInstance.value) {
      markerInstance.value.setMap(null)
      markerInstance.value = null
    }
    if (mapInstance.value) {
      mapInstance.value.destroy()
      mapInstance.value = null
    }
  }

  onUnmounted(() => {
    destroyMap()
  })

  return { initMap, destroyMap, error, mapInstance }
}
