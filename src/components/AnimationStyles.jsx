export default function AnimationStyles() {
  return (
    <style>{`
      @keyframes slideInFromTop {
        from {
          opacity: 0;
          transform: translateY(-20px) scale(0.97);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      @keyframes slideOutLeft {
        from {
          opacity: 1;
          transform: translateX(0);
        }
        to {
          opacity: 0;
          transform: translateX(-100%);
        }
      }

      @keyframes confettiFall {
        0% {
          transform: translateY(0) rotate(0deg) scale(1);
          opacity: 1;
        }
        100% {
          transform: translateY(100vh) rotate(720deg) scale(0.3);
          opacity: 0;
        }
      }

      button:active {
        transform: scale(0.95) !important;
      }
    `}</style>
  )
}
