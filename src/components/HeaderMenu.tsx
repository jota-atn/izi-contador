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
      setTop(y + height + 8);
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
        {/* Pressable único cobre a tela toda e fecha ao tocar fora */}
        <Pressable style={s.backdrop} onPress={() => setOpen(false)}>
          {/*
            onStartShouldSetResponder reclama o evento para o dropdown antes
            do Pressable pai — assim toques dentro do dropdown não fecham o menu,
            mas toques fora (onde só o Pressable existe) fecham.
          */}
          <View style={[s.dropdown, { top }]} onStartShouldSetResponder={() => true}>
            {items.map((item, i) => (
              <TouchableOpacity
                key={item.label}
                onPress={() => handleItem(item.onPress)}
                style={[s.item, i < items.length - 1 && s.itemBorder]}
              >
                <Text style={[s.itemText, item.danger && s.itemDanger]}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const s = StyleSheet.create({
  backdrop: {
    flex: 1,
  },
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
