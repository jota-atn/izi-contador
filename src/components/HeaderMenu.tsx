import { useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  type MeasureInWindowOnSuccessCallback,
} from 'react-native';

interface Item {
  label: string;
  onPress: () => void;
  danger?: boolean;
  icon?: React.ReactNode;
  section?: string;
}

interface Props {
  items: Item[];
}

export function HeaderMenu({ items }: Props) {
  const [open, setOpen] = useState(false);
  const [top, setTop] = useState(0);
  const btnRef = useRef<React.ElementRef<typeof TouchableOpacity>>(null);

  function openMenu() {
    btnRef.current?.measureInWindow((...args: Parameters<MeasureInWindowOnSuccessCallback>) => {
      const [, y, , height] = args;
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
        <Pressable style={s.backdrop} onPress={() => setOpen(false)}>
          <View style={[s.dropdown, { top }]} onStartShouldSetResponder={() => true}>
            {items.map((item, i) => {
              const novaSecao = item.section && item.section !== items[i - 1]?.section;
              return (
                <View key={item.label}>
                  {novaSecao && (
                    <View style={[s.sectionLabel, i > 0 && s.sectionLabelBorder]}>
                      <Text style={s.sectionLabelText}>{item.section}</Text>
                    </View>
                  )}
                  <TouchableOpacity
                    onPress={() => handleItem(item.onPress)}
                    style={[s.item, i < items.length - 1 && s.itemBorder]}
                  >
                    {item.icon && <View style={s.iconWrap}>{item.icon}</View>}
                    <Text style={[s.itemText, item.danger && s.itemDanger]}>{item.label}</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
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
    minWidth: 210,
    backgroundColor: '#0f172a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
    overflow: 'hidden',
    elevation: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  iconWrap: {
    width: 20,
    alignItems: 'center',
    marginRight: 12,
  },
  itemText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#e2e8f0',
  },
  itemDanger: {
    color: '#f87171',
  },
  sectionLabel: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
    backgroundColor: '#0b1220',
  },
  sectionLabelBorder: {
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
  },
  sectionLabelText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
});
