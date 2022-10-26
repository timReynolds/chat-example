interface UsernameProps {
  username: string;
}

const Username = ({ username }: UsernameProps) => {
  return <div className="text-lg">{username}</div>;
};

export default Username;
