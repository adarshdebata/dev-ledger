/** Re-mounts on every navigation, so each page fades in gently (not at all under reduced motion). */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="animate-page-in motion-reduce:animate-none">{children}</div>;
}
