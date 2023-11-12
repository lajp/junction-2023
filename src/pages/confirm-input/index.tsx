import Link from 'next/link';

const ConfirmInput = () => {
  return (
    <div>
      <h1>Please confirm your input:</h1>
      <Link href="/dashboard">
        <button className="btn btn-success btn-lg">Confirm</button>
      </Link>
    </div>
  );
};

export default ConfirmInput;
