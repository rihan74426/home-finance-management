"use client";

export default function Page() {
  return (
    <div>
      <main className="page-wrapper"> This is my portfolio page.</main>
      <style jsx>{`
        .page-wrapper {
          display: flex;
          flex-direction: column;
          align-items: stretch;
          min-height: 100vh;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0;
          gap: 5rem;
          box-sizing: border-box;
        }
        @media (max-width: 1024px) {
          .page-wrapper {
            gap: 4rem;
            max-width: 920px;
          }
        }
        @media (max-width: 640px) {
          .page-wrapper {
            gap: 3rem;
          }
        }
      `}</style>
    </div>
  );
}
