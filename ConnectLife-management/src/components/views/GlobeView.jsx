import Globe from "react-globe.gl";
import { useRef, useEffect } from "react";
import { marketLocations } from "../../data/marketLocations";

export default function GlobeView({ isDark, children }) {
  const globeEl = useRef();

  useEffect(() => {
    const globe = globeEl.current;
    if (!globe) return;

    globe.controls().autoRotate = true;
    globe.controls().autoRotateSpeed = 0.5;
    globe.controls().enableZoom = false;

    globe.pointOfView({lat: 20, lng: 15, altitude: 1.75});
  }, []);

  return (
    <div className="globe-view">
      <div className="globe-canvas-wrap">
        <Globe
          ref={globeEl}
          width={window.innerWidth}
          height={window.innerHeight}
          globeOffset={[0, 80]}
          backgroundColor="rgba(0,0,0,0)"
          globeImageUrl={
            isDark
              ? "//unpkg.com/three-globe/example/img/earth-night.jpg"
              : "https://raw.githubusercontent.com/vasturiano/three-globe/master/example/img/earth-blue-marble.jpg"
          }
          bumpImageUrl="https://raw.githubusercontent.com/vasturiano/three-globe/master/example/img/earth-topology.png"
          showAtmosphere
          atmosphereColor={isDark ? "#1a6fa8" : "#a8d8ea"}
          atmosphereAltitude={0.15}
          pointsData={marketLocations}
          pointLat="lat"
          pointLng="lng"
          pointColor={() => (isDark ? "#64c8ff" : "#de4545")}
          pointRadius={0.4}
          pointAltitude={0.03}
        />

        <div className="globe-overlay">
          {children}
        </div>
      </div>
    </div>
  );
}