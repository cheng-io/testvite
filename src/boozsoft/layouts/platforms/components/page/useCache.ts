import { computed, ref, unref } from 'vue';
import { useRootSetting } from '/@/hooks/setting/useRootSetting';
import { tryTsxEmit } from '/@/utils/helper/vueHelper';
import { PAGE_LAYOUT_KEY,useTabStoreWidthOut } from '/@/store/modules/tab';

import { useRouter } from 'vue-router';

const ParentLayoutName = 'ParentLayout';
export function useCache(isPage: boolean) {
  const name = ref('');
  const { currentRoute } = useRouter();

  tryTsxEmit((instance) => {
    const routeName = instance.type.name;
    if (routeName && ![ParentLayoutName].includes(routeName)) {
      name.value = routeName;
    } else {
      const matched = currentRoute.value?.matched;
      if (!matched) {
        return;
      }
      const len = matched.length;
      if (len < 2) return;
      name.value = matched[len - 2].name as string;
    }
  });

  const { getOpenKeepAlive } = useRootSetting();

  const getCaches = computed((): string[] => {
    if (!unref(getOpenKeepAlive)) {
      return [];
    }
    const tabStore=useTabStoreWidthOut()
    const cached = tabStore.getCachedMapState;

    if (isPage) {
      //  page Layout
      return cached.get(PAGE_LAYOUT_KEY) || [];
    }
    const cacheSet = new Set<string>();
    cacheSet.add(unref(name));

    const list = cached.get(unref(name));

    if (!list) {
      return Array.from(cacheSet);
    }
    list.forEach((item) => {
      cacheSet.add(item);
    });

    return Array.from(cacheSet);
  });
  return { getCaches };
}
