

interface ReceivedInvitationsHeaderProps {
  title: string;
  countTitle: string;
  count: number;
  children?: React.ReactNode;
}

export function ReceivedInvitationsHeader({
  title,
  countTitle,
  count,
}: ReceivedInvitationsHeaderProps) {
  return (
    <div className="px-6 py-5 border-b border-border">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            {title}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            <span className="tabular-nums font-medium">{count}</span>{" "}
            {countTitle}
          </p>
        </div>
      </div>
    </div>
  );
}
