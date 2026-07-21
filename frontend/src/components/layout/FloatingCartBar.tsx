import { Link, useRouterState } from "@tanstack/react-router";
import { ShoppingBag, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCartStore, selectCartCount } from "@/store/cartStore";

const HIDDEN_ON = ["/cart", "/checkout"];

export function FloatingCartBar() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const count = useCartStore(selectCartCount);
  const show = count > 0 && !HIDDEN_ON.includes(pathname);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="fixed inset-x-0 z-40 flex justify-center px-4 pointer-events-none md:hidden"
          style={{ bottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
        >
          <Link
            to="/cart"
            className="pointer-events-auto flex items-center gap-3 bg-primary text-primary-foreground rounded-full pl-2.5 pr-4 py-2 shadow-pop hover:brightness-105 active:scale-[0.98] transition"
          >
            <span className="w-9 h-9 rounded-full bg-white/20 grid place-items-center shrink-0">
              <ShoppingBag className="w-[18px] h-[18px]" />
            </span>
            <span className="leading-tight text-left">
              <span className="block text-sm font-bold">View cart</span>
              <span className="block text-[11px] opacity-90">
                {count} item{count > 1 ? "s" : ""}
              </span>
            </span>
            <ChevronRight className="w-4 h-4 ml-0.5 shrink-0" />
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
