import { useRef, useState } from 'react';
import { Modal, TouchableOpacity, TouchableWithoutFeedback, View, Text } from 'react-native';

interface Item {
  label: string;
  onPress: () => void;
  danger?: boolean;
}

interface Props {
  items: Item[];
}

export function HeaderMenu({ items }: Props) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, right: 0 });
  const btnRef = useRef<View>(null);

  function openMenu() {
    btnRef.current?.measureInWindow((x, w, y, h) => {
      setPos({ top: y + h + 4, right: 0 });
      setOpen(true);
    });
  }

  function handleItem(fn: () => void) {
    setOpen(false);
    setTimeout(fn, 150);
  }

  return (
    <>
      <View ref={btnRef}>
        <TouchableOpacity
          onPress={openMenu}
          className="w-9 h-9 rounded-full border border-slate-700 items-center justify-center"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text className="text-slate-400 text-lg font-black leading-none">⋮</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableWithoutFeedback onPress={() => setOpen(false)}>
          <View className="flex-1">
            <View
              className="absolute bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden"
              style={{ top: pos.top, right: 16, minWidth: 180 }}
            >
              {items.map((item, i) => (
                <TouchableOpacity
                  key={item.label}
                  onPress={() => handleItem(item.onPress)}
                  className={`px-5 py-3.5 ${i < items.length - 1 ? 'border-b border-slate-800' : ''}`}
                >
                  <Text
                    className={`text-sm font-bold ${item.danger ? 'text-red-400' : 'text-slate-200'}`}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}
