import clsx from "clsx";

interface OnlineStatusProps {
  online: boolean;
}

const OnlineStatus = ({ online }: OnlineStatusProps) => {
  const classes = clsx("rounded-full w-3 h-3 m-1", {
    "bg-red-500": !online,
    "bg-green-500": online,
  });

  return <div className={classes} />;
};

export default OnlineStatus;
