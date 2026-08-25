/* Tectonic Signal OS: reusable product drawer for evidence, actions, and honest prototype state. */
import { ReactNode, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog";

interface ManusDialogProps {
  title?: string;
  description?: string;
  logo?: string;
  actionLabel?: string;
  open?: boolean;
  children?: ReactNode;
  onLogin?: () => void;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
}

export function ManusDialog({ title, description, logo, actionLabel, open = false, children, onLogin, onOpenChange, onClose }: ManusDialogProps) {
  const [internalOpen, setInternalOpen] = useState(open);
  useEffect(() => { if (!onOpenChange) setInternalOpen(open); }, [open, onOpenChange]);
  const handleOpenChange = (nextOpen: boolean) => { onOpenChange ? onOpenChange(nextOpen) : setInternalOpen(nextOpen); if (!nextOpen) onClose?.(); };

  return <Dialog open={onOpenChange ? open : internalOpen} onOpenChange={handleOpenChange}>
    <DialogContent className="drawer-dialog">
      <div className="drawer-dialog-head">
        <div className="drawer-dialog-lockup"><span className="drawer-dialog-mark">{logo ? <img src={logo} alt=""/> : <span/>}</span><span className="drawer-dialog-kicker">EVIDENCE DRAWER / LIVE NODE</span></div>
        {title ? <DialogTitle>{title}</DialogTitle> : null}
        {description ? <DialogDescription>{description}</DialogDescription> : null}
      </div>
      {children}
      {onLogin ? <DialogFooter><Button className="drawer-dialog-action" onClick={onLogin}>{actionLabel || "Acknowledge state"}</Button></DialogFooter> : null}
    </DialogContent>
  </Dialog>;
}
