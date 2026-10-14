export default function StartupCard({ startup }) {
  const price = startup.price.toLocaleString("ko-KR");
  const rate = startup.changeRate > 0 ? `+${startup.changeRate}` : startup.changeRate;

  return (
    <article className="startup-card">
      <h3>{startup.name}</h3>
      <p>
        {startup.industry} · {startup.region}
      </p>
      <div className="startup-price">
        <strong>{price}원</strong>
        <span>{rate}%</span>
      </div>
    </article>
  );
}
