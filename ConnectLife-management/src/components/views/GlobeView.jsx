import Globe from "react-globe.gl";
import { useRef, useEffect } from "react";
import { marketLocations } from "../../data/marketLocations";

export default function GlobeView({ isDark, children, hoveredCondition }) {
  const globeEl = useRef();

  useEffect(() => {
    const globe = globeEl.current;
    if (!globe) return;
    globe.controls().autoRotate = true;
    globe.controls().autoRotateSpeed = 0.5;
    globe.controls().enableZoom = false;
    globe.pointOfView({ lat: 20, lng: 15, altitude: 1.75 });
  }, []);

  useEffect(() => {
    const globe = globeEl.current;
    if (!globe) return;
    globe.controls().autoRotate = !hoveredCondition;
  }, [hoveredCondition]);

  useEffect(() => {
    const globe = globeEl.current;
    if (!globe || !hoveredCondition) return;

    const points = marketLocations.filter(p =>
      p.conditions.includes(hoveredCondition)
    );
    if (points.length === 0) return;

    const lat = points.reduce((sum, p) => sum + p.lat, 0) / points.length;
    const lng = points.reduce((sum, p) => sum + p.lng, 0) / points.length;

    globe.pointOfView({ lat, lng, altitude: 1.75 }, 800);
  }, [hoveredCondition]);

  const pointColor = (point) => {
    if (!hoveredCondition) return isDark ? "#64c8ff" : "#de4545";
    return point.conditions.includes(hoveredCondition)
      ? "#f5a623"
      : isDark ? "#1a4a6a" : "#b8d4e0";
  };

  const pointAltitude = (point) => {
    if (!hoveredCondition) return 0.03;
    return point.conditions.includes(hoveredCondition) ? 0.08 : 0.015;
  };

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
          pointColor={pointColor}
          pointRadius={0.4}
          pointAltitude={pointAltitude}
        />
        <div className="globe-overlay">{children}</div>
      </div>
    </div>
  );
}