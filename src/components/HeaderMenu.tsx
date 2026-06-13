import { useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, TouchableOpacity, View, Text } from 'react-native';

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
  const [top, setTop] = useState(0);
  const btnRef = useRef<TouchableOpacity>(null);

  function openMenu() {
    btnRef.current?.measureInWindow((x, y, width, height) => {
      // y=14 h=44 → botão termina em 58. Header tem py-4 (16px) abaixo.
      // Dropdown deve aparecer abaixo do header inteiro: y + h + 16 (padding) + 8 (gap)
      setTop(y + height + 24);
      setOpen(true);
    });
  }

  function handleItem(fn: () => void) {
    setOpen(false);
    setTimeout(fn, 150);
  }

  return (
    <>
      <TouchableOpacity
        ref={btnRef}
        onPress={openMenu}
        style={s.btn}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <View style={s.bar} />
        <View style={s.bar} />
        <View style={s.bar} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        {/* Backdrop: fecha ao tocar fora */}
        <Pressable style={StyleSheet.absoluteFillObject} onPress={() => setOpen(false)}>
          {/* Dropdown: onPress vazio absorve toque pra não fechar ao tocar dentro */}
          <Pressable style={[s.dropdown, { top }]} onPress={() => {}}>
            {items.map((item, i) => (
              <TouchableOpacity
                key={item.label}
                onPress={() => handleItem(item.onPress)}
                style={[s.item, i < items.length - 1 && s.itemBorder]}
              >
                <Text style={[s.itemText, item.danger && s.itemDanger]}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const s = StyleSheet.create({
  btn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  bar: {
    width: 20,
    height: 2,
    backgroundColor: '#cbd5e1',
    borderRadius: 1,
  },
  dropdown: {
    position: 'absolute',
    right: 16,
    minWidth: 190,
    backgroundColor: '#0f172a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
    overflow: 'hidden',
    elevation: 8,
  },
  item: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  itemText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#e2e8f0',
  },
  itemDanger: {
    color: '#f87171',
  },
});
