import { SafeAreaView } from 'react-native-safe-area-context';
import { cn } from "@/lib/utils";
import { Check, ChevronDown } from "lucide-react-native";
import * as React from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface SelectContextValue {
  value: string;
  onValueChange: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  items: Record<string, string>;
  registerItem: (value: string, label: string) => void;
}

const SelectContext = React.createContext<SelectContextValue>(
  {} as SelectContextValue,
);

const Select = ({
  value,
  onValueChange,
  children,
  open: openProp,
  onOpenChange,
}: any) => {
  const [openState, setOpenState] = React.useState(false);
  const [items, setItems] = React.useState<Record<string, string>>({});

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = onOpenChange || setOpenState;

  const registerItem = React.useCallback((v: string, l: string) => {
    setItems((prev) => {
      if (prev[v] === l) return prev;
      return { ...prev, [v]: l };
    });
  }, []);

  return (
    <SelectContext.Provider
      value={{ value, onValueChange, open, setOpen, items, registerItem }}
    >
      <View className="relative z-50">{children}</View>
    </SelectContext.Provider>
  );
};

const SelectGroup = ({ children, className }: any) => {
  return <View className={cn("p-1", className)}>{children}</View>;
};

const SelectValue = ({ placeholder, className }: any) => {
  const { value, items } = React.useContext(SelectContext);
  const displayValue = items[value] || value || placeholder;
  return (
    <Text
      className={cn(
        "text-sm text-foreground",
        !value && "text-muted-foreground",
        className,
      )}
    >
      {displayValue}
    </Text>
  );
};

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof TouchableOpacity>,
  React.ComponentPropsWithoutRef<typeof TouchableOpacity>
>(({ className, children, ...props }, ref) => {
  const { setOpen, open } = React.useContext(SelectContext);

  return (
    <TouchableOpacity
      ref={ref}
      onPress={() => setOpen(!open)}
      className={cn(
        "flex-row h-12 w-full items-center justify-between rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronDown
        className="h-4 w-4 opacity-50 text-foreground"
        color="#64748b"
      />
    </TouchableOpacity>
  );
});
SelectTrigger.displayName = "SelectTrigger";

const SelectScrollUpButton = ({ className, ...props }: any) => (
  <View className={cn("hidden", className)} {...props} />
);

const SelectScrollDownButton = ({ className, ...props }: any) => (
  <View className={cn("hidden", className)} {...props} />
);

const SelectContent = React.forwardRef<
  React.ElementRef<typeof Modal>,
  React.ComponentPropsWithoutRef<typeof Modal> & { position?: string } // Add position prop to satisfy interface but ignore it
>(({ className, children, position = "popper", ...props }, ref) => {
  const { open, setOpen } = React.useContext(SelectContext);

  return (
    <Modal
      transparent
      visible={open}
      animationType="fade"
      onRequestClose={() => setOpen(false)}
      {...props}
    >
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={() => setOpen(false)}
        className="bg-black/50"
      >
        <SafeAreaView className="flex-1 justify-center items-center px-4">
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className={cn(
              "bg-background w-full max-h-[50%] rounded-xl shadow-lg border border-border overflow-hidden",
              className,
            )}
          >
            <ScrollView className="p-1">{children}</ScrollView>
          </Pressable>
        </SafeAreaView>
      </Pressable>
    </Modal>
  );
});
SelectContent.displayName = "SelectContent";

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof Text>,
  React.ComponentPropsWithoutRef<typeof Text>
>(({ className, ...props }, ref) => (
  <Text
    ref={ref}
    className={cn(
      "py-1.5 pl-8 pr-2 text-sm font-semibold text-foreground",
      className,
    )}
    {...props}
  />
));
SelectLabel.displayName = "SelectLabel";

const SelectItem = React.forwardRef<
  React.ElementRef<typeof TouchableOpacity>,
  React.ComponentPropsWithoutRef<typeof TouchableOpacity> & {
    value: string;
    label?: string;
  }
>(({ className, children, value, label, ...props }, ref) => {
  const {
    onValueChange,
    setOpen,
    value: selectedValue,
    registerItem,
  } = React.useContext(SelectContext);

  // Register the item's label map
  const textLabel = label || (typeof children === "string" ? children : value);

  React.useEffect(() => {
    if (value && textLabel) {
      registerItem(value, textLabel as string);
    }
  }, [value, textLabel, registerItem]);

  return (
    <TouchableOpacity
      ref={ref}
      onPress={() => {
        onValueChange(value);
        setOpen(false);
      }}
      className={cn(
        "relative flex-row w-full cursor-default select-none items-center rounded-sm py-2 pl-8 pr-2 active:bg-accent outline-none",
        selectedValue === value && "bg-accent",
        className,
      )}
      {...props}
    >
      {selectedValue === value && (
        <View className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          <Check
            className="h-4 w-4 text-foreground"
            size={16}
            color="#0f172a"
          />
        </View>
      )}

      <Text
        className={cn(
          "text-sm text-foreground",
          selectedValue === value && "font-medium",
        )}
      >
        {children || label || value}
      </Text>
    </TouchableOpacity>
  );
});
SelectItem.displayName = "SelectItem";

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof View>,
  React.ComponentPropsWithoutRef<typeof View>
>(({ className, ...props }, ref) => (
  <View
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
));
SelectSeparator.displayName = "SelectSeparator";

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
