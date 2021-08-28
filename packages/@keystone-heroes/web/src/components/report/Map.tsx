import type { FightSuccessResponse } from "@keystone-heroes/api/functions/fight";
// import { isBoss } from "@keystone-heroes/db/data/boss";
import dynamic from "next/dynamic";
import type { KeyboardEvent } from "react";
import { Fragment, useState, useRef, useEffect, useCallback } from "react";
import { useReportStore } from "src/store";
import { classnames } from "src/utils/classnames";
import shallow from "zustand/shallow";

import {
  BLOODLUST_ICON,
  INVIS_POTION_ICON,
  SHROUD_ICON,
  WCL_ASSET_URL,
} from "../AbilityIcon";
import {
  hasBloodLust,
  detectInvisibilityUsage,
  findTormentedLieutenantPull,
} from "./utils";

type MapProps = {
  zones: FightSuccessResponse["dungeon"]["zones"];
  pulls: FightSuccessResponse["pulls"];
};

function useImageDimensions() {
  const [imageSize, setImageSize] = useState<PullIndicatorsProps["imageSize"]>({
    clientHeight: 0,
    clientWidth: 0,
    offsetLeft: 0,
    offsetTop: 0,
  });
  const imageRef = useRef<HTMLImageElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const handleResize = useCallback(() => {
    if (imageRef.current) {
      const { clientHeight, clientWidth, offsetTop, offsetLeft } =
        imageRef.current;

      setImageSize((prev) => {
        // prevent unnecessary rerenders through image onLoad
        if (
          prev.clientHeight !== clientHeight ||
          prev.clientWidth !== clientWidth ||
          prev.offsetTop !== offsetTop ||
          prev.offsetLeft !== offsetLeft
        ) {
          return { clientHeight, clientWidth, offsetTop, offsetLeft };
        }

        return prev;
      });
    }
  }, []);

  useEffect(() => {
    const listener = () => {
      if (rafRef.current) {
        return;
      }

      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        handleResize();
      });
    };

    window.addEventListener("resize", listener);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      window.removeEventListener("resize", listener);
    };
  }, [handleResize]);

  return {
    imageSize,
    imageRef,
    handleResize,
  };
}

const MapOptions = dynamic(
  () => import(/* webpackChunkName: "MapOptions" */ "./MapOptions"),
  {
    ssr: false,
  }
);

export function Map({ zones, pulls }: MapProps): JSX.Element {
  const { imageRef, imageSize, handleResize } = useImageDimensions();
  const tabPanelRef = useRef<HTMLDivElement | null>(null);
  const selectedPull = useReportStore((state) => state.selectedPull);
  const toggleMapOptions = useReportStore((state) => state.toggleMapOptions);
  const mapOptionsVisible = useReportStore((state) => state.mapOptions.visible);

  const zoneToSelect = pulls[selectedPull - 1].zone;
  const tab = zones.findIndex((zone) => zone.id === zoneToSelect);
  const [selectedTab, setSelectedTab] = useState(tab);

  const shouldFocusRef = useRef(false);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (shouldFocusRef.current) {
      shouldFocusRef.current = false;
      buttonRefs.current[selectedTab]?.focus();
    }
  });

  const onTabButtonClick = useCallback((nextIndex) => {
    setSelectedTab(nextIndex);
  }, []);

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>) => {
      const { key } = event;

      const lookupValue =
        key === "ArrowRight" ? 1 : key === "ArrowLeft" ? -1 : null;

      if (!lookupValue) {
        return;
      }

      event.preventDefault();
      shouldFocusRef.current = true;

      setSelectedTab((currentIndex) => {
        const nextIndex = currentIndex + lookupValue;

        // going from first to last
        if (nextIndex < 0) {
          return zones.length - 1;
        }

        // going from nth to nth
        if (zones.length - 1 >= nextIndex) {
          return nextIndex;
        }

        // going from last to first
        return 0;
      });
    },
    [zones.length]
  );

  return (
    <section className="w-full max-w-screen-xl lg:w-5/6">
      <h2 className="text-2xl font-bold">Route</h2>
      <svg height="0" width="0">
        <marker
          id="triangle"
          viewBox="0 0 10 10"
          refX="1"
          refY="5"
          markerUnits="strokeWidth"
          markerWidth="10"
          markerHeight="10"
          orient="auto"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="white" />
        </marker>
      </svg>
      <div className="flex justify-between">
        <div role="tablist" aria-orientation="horizontal" className="flex">
          {zones.map((zone, index) => {
            const selected = index === selectedTab;

            return (
              <div className="p-4" key={zone.id}>
                <button
                  type="button"
                  role="tab"
                  data-orientation="horizontal"
                  aria-controls={`tabpanel-${zone.id}`}
                  id={`tab-${zone.id}`}
                  onKeyDown={onKeyDown}
                  ref={(ref) => {
                    buttonRefs.current[index] = ref;
                  }}
                  className={`focus:outline-none focus:ring disabled:cursor-not-allowed dark:disabled:text-coolgray-500 disabled:text-coolgray-700 ${
                    selected ? "border-coolgray-500 font-bold" : ""
                  }`}
                  onClick={() => {
                    onTabButtonClick(index);
                  }}
                >
                  {zone.name}
                </button>
              </div>
            );
          })}
        </div>
        <div className="p-4">
          <button
            type="button"
            onClick={toggleMapOptions}
            className="focus:outline-none focus:ring disabled:cursor-not-allowed dark:disabled:text-coolgray-500 disabled:text-coolgray-700"
          >
            Map Options
          </button>
          {mapOptionsVisible && <MapOptions onClose={toggleMapOptions} />}
        </div>
      </div>
      {zones.map((zone, index) => {
        const hidden = index !== selectedTab;

        return (
          <div
            role="tabpanel"
            data-orientation="horizontal"
            data-state="active"
            id={`tabpanel-${zone.id}`}
            aria-labelledby={`tab-${zone.id}`}
            // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
            tabIndex={0}
            ref={hidden ? undefined : tabPanelRef}
            key={zone.id}
          >
            {hidden ? null : (
              <>
                <picture>
                  {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
                  <img
                    src={`/static/maps/${zone.id}.png`}
                    alt={zone.name}
                    ref={imageRef}
                    className="object-cover w-full h-full"
                    onLoad={handleResize}
                  />
                </picture>
                <PullIndicators
                  pulls={pulls}
                  imageSize={imageSize}
                  zoneID={zone.id}
                  onDoorClick={(zoneID: number) => {
                    const nextZoneIndex = zones.findIndex(
                      (zone) => zone.id === zoneID
                    );

                    if (nextZoneIndex > -1) {
                      onTabButtonClick(nextZoneIndex);
                    }
                  }}
                />
              </>
            )}
          </div>
        );
      })}
    </section>
  );
}

type PullIndicatorsProps = Pick<MapProps, "pulls"> & {
  imageSize: Pick<
    HTMLImageElement,
    "clientHeight" | "clientWidth" | "offsetLeft" | "offsetTop"
  >;
  zoneID: number;
  onDoorClick: (zoneID: number) => void;
};

function PullIndicators({
  pulls,
  imageSize,
  zoneID,
  onDoorClick,
}: PullIndicatorsProps) {
  const thisZonesPulls = pulls.filter((pull) => pull.zone === zoneID);

  return (
    <>
      <style jsx>
        {`
          .svg {
            left: ${imageSize.offsetLeft}px;
            top: ${imageSize.offsetTop}px;
            width: ${imageSize.clientWidth}px;
            height: ${imageSize.clientHeight}px;
          }
        `}
      </style>
      <svg className="absolute svg focus:outline-none">
        <DoorIndicators
          id={zoneID}
          xFactor={imageSize.clientWidth}
          yFactor={imageSize.clientHeight}
          onDoorClick={onDoorClick}
        />
        <MapChangePolyline
          xFactor={imageSize.clientWidth}
          yFactor={imageSize.clientHeight}
          zoneID={zoneID}
          pulls={pulls}
        />
        {thisZonesPulls.map((pull, index) => {
          const x = pull.x * imageSize.clientWidth;
          const y = pull.y * imageSize.clientHeight;
          const nextPull =
            thisZonesPulls[index + 1]?.id === pull.id + 1
              ? thisZonesPulls[index + 1]
              : null;

          return (
            <Fragment key={pull.startTime}>
              <PullIndicatorIcon pull={pull} x={x} y={y} />

              <PullConnectionPolyline
                x={x}
                y={y}
                nextPull={nextPull}
                imageSize={imageSize}
              />
            </Fragment>
          );
        })}
      </svg>
    </>
  );
}

type ShroudOrInvisIndicatorProps = {
  x: number;
  y: number;
  nextX: number | null;
  nextY: number | null;
  type: "shroud" | "invisibility";
};

function ShroudOrInvisIndicator({
  x,
  y,
  nextX,
  nextY,
  type,
}: ShroudOrInvisIndicatorProps) {
  if (!nextX || !nextY) {
    return null;
  }

  const diffX = nextX - x;
  const diffY = nextY - y;

  const quarterX = diffX / 4;
  const quarterY = diffY / 4;

  const twentyFivePercentX = x + quarterX;
  const twentyFivePercentY = y + quarterY;

  const seventyFivePercentX = x + quarterX * 3;
  const seventyFivePercentY = y + quarterY * 3;

  const img = type === "shroud" ? SHROUD_ICON : INVIS_POTION_ICON;

  return (
    <>
      <image
        href={img}
        width={24}
        height={24}
        x={twentyFivePercentX - 12}
        y={twentyFivePercentY - 12}
      />
      <image
        href={img}
        width={24}
        height={24}
        x={seventyFivePercentX - 12}
        y={seventyFivePercentY - 12}
      />
    </>
  );
}

type PullIndicatorIconProps = {
  pull: FightSuccessResponse["pulls"][number];
  x: number;
  y: number;
};

function PullIndicatorIcon({ pull, x, y }: PullIndicatorIconProps) {
  const [selectedPull, setSelectedPull] = useReportStore(
    (state) => [state.selectedPull, state.setSelectedPull],
    shallow
  );

  const selected = selectedPull === pull.id;

  const size = selected ? 32 : 24;

  const centerX = x - size / 2;
  const centerY = y - size / 2;

  const gProps = {
    className: "cursor-pointer",
    onClick: () => {
      setSelectedPull(pull.id);
    },
  };

  const sharedProps = {
    className: classnames(
      "fill-current text-black rounded-full",
      selected ? "opacity-100 outline-white" : "opacity-50"
    ),
    width: size,
    height: size,
    x: centerX,
    y: centerY,
  };

  if (hasBloodLust(pull)) {
    return (
      <g {...gProps}>
        <image
          aria-label="Bloodlust was used on this pull."
          href={BLOODLUST_ICON}
          {...sharedProps}
        />
        <text
          textAnchor="middle"
          x={x}
          y={y + 21.02 / 4}
          className="text-white fill-current"
        >
          {pull.id}
        </text>
      </g>
    );
  }

  const tormentedLieutenant = findTormentedLieutenantPull(pull);

  if (tormentedLieutenant) {
    return (
      <g {...gProps}>
        <image
          aria-label={tormentedLieutenant.name}
          href={`${WCL_ASSET_URL}${tormentedLieutenant.icon}.jpg`}
          {...sharedProps}
        />
        <text
          textAnchor="middle"
          x={x}
          y={y + 21.02 / 4}
          className="text-white fill-current"
        >
          {pull.id}
        </text>
      </g>
    );
  }

  // const boss = pull.npcs.find((npc) => {
  //   return isBoss(npc.id);
  // });

  return (
    <g {...gProps}>
      {/* {boss ? (
        <image
          aria-label={boss.name}
          href={`/static/npcs/${boss.id}.png`}
          className={classnames(
            selected ? "outline-white opacity-100" : "opacity-70"
          )}
          width={32}
          height={32}
          x={x - 32 / 2}
          y={y - 32 / 2}
        />
      ) : (
        <> */}
      <circle cx={x} cy={y} r={15} className={sharedProps.className} />
      <text
        textAnchor="middle"
        x={x}
        y={y + 21.02 / 4}
        className="text-white fill-current"
      >
        {pull.id}
      </text>
      {/* </>
      )} */}
    </g>
  );
}

type PullConnectionPolylineProps = {
  x: number;
  y: number;
  nextPull: FightSuccessResponse["pulls"][number] | null;
  imageSize: Pick<
    HTMLImageElement,
    "clientHeight" | "clientWidth" | "offsetLeft" | "offsetTop"
  >;
};

function PullConnectionPolyline({
  nextPull,
  x,
  y,
  imageSize,
}: PullConnectionPolylineProps) {
  const renderPullConnectionLines = useReportStore(
    (state) => state.mapOptions.renderPullConnectionLines
  );

  if (!renderPullConnectionLines) {
    return null;
  }

  const invisibilityUsage = nextPull ? detectInvisibilityUsage(nextPull) : null;

  const nextX = nextPull ? nextPull.x * (imageSize.clientWidth ?? 0) : null;
  const nextY = nextPull ? nextPull.y * (imageSize.clientHeight ?? 0) : null;

  const middleX = nextX ? x + (nextX - x) / 2 : null;
  const middleY = nextY ? y + (nextY - y) / 2 : null;

  if (!nextX || !nextY || !middleX || !middleY) {
    return null;
  }

  return (
    <>
      <style jsx>
        {`
          .polyline {
            marker-mid: url(#triangle);
          }
        `}
      </style>
      <polyline
        className={classnames(
          "polyline stroke-current",
          invisibilityUsage ? "text-green-500" : "text-red-500"
        )}
        points={`${x},${y} ${middleX},${middleY} ${nextX},${nextY}`}
      />
      {invisibilityUsage && (
        <ShroudOrInvisIndicator
          x={x}
          y={y}
          nextX={nextX}
          nextY={nextY}
          type={invisibilityUsage}
        />
      )}
    </>
  );
}

type DoorIndicatorsProps = Pick<MapProps["zones"][number], "id"> &
  Pick<PullIndicatorsProps, "onDoorClick"> & {
    xFactor: number;
    yFactor: number;
  };

type DoorType = "left" | "right" | "up" | "down";

const zoneDoors: Record<
  number,
  { type: DoorType; x: number; y: number; to: number }[]
> = {
  // The Necrotic Wake
  1666: [
    {
      type: "up",
      x: 0.167_680_278_019_113_8,
      y: 0.389_830_508_474_576_3,
      to: 1667,
    },
  ],
  1667: [
    {
      type: "up",
      x: 0.495_221_546_481_320_6,
      y: 0.544_980_443_285_528_1,
      to: 1668,
    },
  ],
  1668: [
    {
      type: "down",
      x: 0.492_615_117_289_313_6,
      y: 0.481_095_176_010_430_2,
      to: 1666,
    },
  ],
  // Spires of Ascension
  1692: [
    {
      type: "up",
      x: 0.711_188_204_683_434_5,
      y: 0.156_046_814_044_213_28,
      to: 1693,
    },
  ],
  1693: [
    {
      type: "down",
      x: 0.349_522_983_521_248_94,
      y: 0.609_882_964_889_466_8,
      to: 1692,
    },
    {
      type: "up",
      x: 0.693_842_150_910_667_8,
      y: 0.390_117_035_110_533_14,
      to: 1694,
    },
  ],
  1694: [
    {
      type: "down",
      x: 0.364_267_129_228_100_6,
      y: 0.778_933_680_104_031_2,
      to: 1693,
    },
    {
      type: "up",
      x: 0.483_954_900_260_190_8,
      y: 0.457_737_321_196_358_9,
      to: 1695,
    },
  ],
  1695: [
    {
      type: "down",
      x: 0.410_234_171_725_932_35,
      y: 0.685_305_591_677_503_3,
      to: 1694,
    },
  ],
  // Sanguine Depths
  1675: [
    {
      type: "down",
      x: 0.440_589_765_828_274_1,
      y: 0.879_063_719_115_734_7,
      to: 1676,
    },
  ],
  1676: [
    {
      type: "up",
      x: 0.491_760_624_457_935_84,
      y: 0.767_230_169_050_715_2,
      to: 1675,
    },
  ],
  // Halls of Atonement
  1663: [
    {
      type: "left",
      x: 0.130_095_403_295_750_23,
      y: 0.524_057_217_165_149_5,
      to: 1664,
    },
  ],
  1664: [
    {
      type: "right",
      x: 0.833_477_883_781_439_7,
      y: 0.486_345_903_771_131_35,
      to: 1663,
    },
    {
      type: "up",
      x: 0.174_327_840_416_305_28,
      y: 0.361_508_452_535_760_75,
      to: 1665,
    },
  ],
  1665: [
    {
      type: "down",
      x: 0.677_363_399_826_539_5,
      y: 0.473_342_002_600_780_24,
      to: 1664,
    },
  ],
  // Plaguefall
  1674: [
    {
      type: "down",
      x: 0.562_884_784_520_668_5,
      y: 0.803_689_064_558_629_8,
      to: 1697,
    },
  ],
  1697: [
    {
      type: "up",
      x: 0.536_499_560_246_262_1,
      y: 0.424_242_424_242_424_25,
      to: 1674,
    },
  ],
  // Theater of Pain
  1683: [
    {
      type: "down",
      x: 0.490_686_098_654_708_5,
      y: 0.403_768_506_056_527_6,
      to: 1684,
    },
  ],
  1684: [
    {
      type: "up",
      x: 0.305_970_149_253_731_34,
      y: 0.107_692_307_692_307_7,
      to: 1685,
    },
    {
      type: "left",
      x: 0.186_567_164_179_104_5,
      y: 0.268_531_468_531_468_53,
      to: 1686,
    },
    {
      type: "up",
      x: 0.306_902_985_074_626_9,
      y: 0.323_076_923_076_923_1,
      to: 1683,
    },
  ],
  1685: [
    {
      type: "down",
      x: 0.697_980_684_811_237_9,
      y: 0.869_565_217_391_304_3,
      to: 1684,
    },
  ],
  1686: [
    {
      type: "down",
      x: 0.229_148_375_768_217_73,
      y: 0.304_347_826_086_956_54,
      to: 1687,
    },
    {
      type: "down",
      x: 0.160_667_251_975_417_04,
      y: 0.557_312_252_964_426_9,
      to: 1687,
    },
    {
      type: "right",
      x: 0.797_190_517_998_244,
      y: 0.682_476_943_346_508_5,
      to: 1684,
    },
  ],
  1687: [
    {
      type: "up",
      x: 0.232_660_228_270_412_63,
      y: 0.223_978_919_631_093_54,
      to: 1686,
    },
    {
      type: "up",
      x: 0.158_911_325_724_319_57,
      y: 0.565_217_391_304_347_8,
      to: 1686,
    },
    {
      type: "up",
      x: 0.631_255_487_269_534_7,
      y: 0.824_769_433_465_085_7,
      to: 1686,
    },
  ],
  // De Other Side
  1680: [
    {
      type: "left",
      x: 0.252_100_840_336_134_45,
      y: 0.566_204_287_515_762_9,
      to: 1679,
    },
    {
      type: "down",
      x: 0.495_119_787_045_252_9,
      y: 0.897_606_382_978_723_4,
      to: 1678,
    },
    {
      type: "right",
      x: 0.739_436_619_718_309_9,
      y: 0.566_204_287_515_762_9,
      to: 1677,
    },
  ],
  1679: [
    {
      type: "right",
      x: 0.886_490_807_354_116_7,
      y: 0.467_625_899_280_575_5,
      to: 1680,
    },
  ],
  1678: [
    {
      type: "up",
      x: 0.480_069_324_090_121_3,
      y: 0.117_035_110_533_159_94,
      to: 1680,
    },
  ],
  1677: [
    {
      type: "left",
      x: 0.064_444_444_444_444_44,
      y: 0.569_753_810_082_063_3,
      to: 1680,
    },
  ],
};

function DoorIndicators({
  id,
  xFactor,
  yFactor,
  onDoorClick,
}: DoorIndicatorsProps): JSX.Element | null {
  const doors = zoneDoors[id];

  if (!doors) {
    return null;
  }

  return (
    <g>
      {doors.map((door) => (
        <image
          href={`/static/icons/door_${door.type}.png`}
          key={door.x}
          x={door.x * xFactor}
          y={door.y * yFactor}
          className="w-8 h-6 cursor-pointer"
          onClick={() => {
            onDoorClick(door.to);
          }}
        />
      ))}
    </g>
  );
}

type MapChangePolylineProps = {
  pulls: FightSuccessResponse["pulls"];
  zoneID: number;
  xFactor: number;
  yFactor: number;
};

function MapChangePolyline({
  pulls,
  xFactor,
  yFactor,
  zoneID,
}: MapChangePolylineProps): JSX.Element | null {
  const renderMapChangeLines = useReportStore(
    (state) => state.mapOptions.renderMapChangeLines
  );

  if (!renderMapChangeLines) {
    return null;
  }

  // door width / 2 / svg width
  const doorXOffset = 0.012_830_793_905_372_895;
  const doorYOffset = 0.014_440_433_212_996_39;

  return (
    <>
      <style jsx>
        {`
          .polyline {
            marker-mid: url(#triangle);
          }
        `}
      </style>

      {pulls
        .reduce<
          {
            startX: number;
            middleX: number;
            endX: number;
            startY: number;
            middleY: number;
            endY: number;
            key: number;
          }[]
        >((acc, pull, index) => {
          const lastPull = pulls[index - 1];

          if (!lastPull) {
            return acc;
          }

          const lastPullWasInOtherZone = lastPull.zone !== zoneID;
          const thisPullIsInThisZone = pull.zone === zoneID;

          if (lastPullWasInOtherZone && thisPullIsInThisZone) {
            const doors = zoneDoors[pull.zone];

            if (!doors) {
              return acc;
            }

            const originDoor = doors.find((door) => door.to === lastPull.zone);

            if (!originDoor) {
              return acc;
            }

            const middleX = pull.x + (originDoor.x + doorXOffset - pull.x) / 2;
            const middleY = pull.y + (originDoor.y + doorYOffset - pull.y) / 2;

            return [
              ...acc,
              {
                startX: (originDoor.x + doorXOffset) * xFactor,
                middleX: middleX * xFactor,
                endX: pull.x * xFactor,

                startY: (originDoor.y + doorYOffset) * yFactor,
                middleY: middleY * yFactor,
                endY: pull.y * yFactor,

                key: index,
              },
            ];
          }

          if (!lastPullWasInOtherZone && !thisPullIsInThisZone) {
            const doors = zoneDoors[lastPull.zone];

            if (!doors) {
              return acc;
            }

            const targetDoor = doors.find((door) => door.to === pull.zone);

            if (!targetDoor) {
              return acc;
            }

            const middleX =
              lastPull.x + (targetDoor.x + doorXOffset - lastPull.x) / 2;
            const middleY =
              lastPull.y + (targetDoor.y + doorYOffset - lastPull.y) / 2;

            return [
              ...acc,
              {
                startX: lastPull.x * xFactor,
                middleX: middleX * xFactor,
                endX: (targetDoor.x + doorXOffset) * xFactor,

                startY: lastPull.y * yFactor,
                middleY: middleY * yFactor,
                endY: (targetDoor.y + doorYOffset) * yFactor,

                key: index,
              },
            ];
          }

          return acc;
        }, [])
        .map(({ startX, startY, middleX, middleY, endX, endY, key }) => {
          return (
            <polyline
              key={key}
              className="text-blue-900 stroke-current polyline"
              points={`${startX},${startY} ${middleX},${middleY} ${endX},${endY}`}
            />
          );
        })}
    </>
  );
}
