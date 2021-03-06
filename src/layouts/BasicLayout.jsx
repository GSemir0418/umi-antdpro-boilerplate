/**
 * Ant Design Pro v4 use `@ant-design/pro-layout` to handle Layout.
 *
 * @see You can view component api by: https://github.com/ant-design/ant-design-pro-layout
 */
import ProLayout, { DefaultFooter, SettingDrawer } from '@ant-design/pro-layout'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useIntl, connect, history } from 'umi'
import { GithubOutlined } from '@ant-design/icons'
import { Result, Button, Tabs, message, Dropdown, Menu } from 'antd'
import Authorized from '@/utils/Authorized'
import RightContent from '@/components/GlobalHeader/RightContent'
import { getMatchMenu } from '@umijs/route-utils'
import styles from './BasicLayout.less'
// import logo from '../assets/logo.svg';

const tabMenus = []

const noMatch = (
  <Result
    status={403}
    title='403'
    subTitle='Sorry, you are not authorized to access this page.'
    extra={
      <Button type='primary'>
        <Link to='/user/login'>Go Login</Link>
      </Button>
    }
  />
)

/** Use Authorized check all menu item */
const menuDataRender = menuList =>
  menuList.map(item => {
    const tabMenu = tabMenus.filter(tm => tm.path === item.path)
    if (tabMenu.length === 0 && item.name) {
      tabMenus.push({
        title: item.name,
        key: item.path,
        path: item.path,
      })
    }

    const localItem = {
      ...item,
      children: item.children ? menuDataRender(item.children) : undefined,
    }
    return Authorized.check(item.authority, localItem, null)
  })

// 页脚
const defaultFooterDom = (
  <DefaultFooter
    copyright={`${new Date().getFullYear()} 创新产品开发部出品`}
    links={[
      {
        key: 'SUPCON',
        title: 'SUPCON',
        href: 'https://www.supcontech.com/',
        blankTarget: true,
      },
      {
        key: 'github',
        title: <GithubOutlined />,
        href: 'https://github.com/GSemir0418/',
        blankTarget: true,
      },
    ]}
  />
)

const BasicLayout = props => {
  const {
    dispatch,
    children,
    settings,
    location = {
      pathname: '/',
    },
  } = props

  const [tabs, setTabs] = useState([])
  const [activeTabKey, setActiveTabKey] = useState('')

  const menuDataRef = useRef([])
  useEffect(() => {
    if (dispatch) {
      dispatch({
        type: 'user/fetchCurrent',
      })
    }
  }, [])

  /** Init variables */
  const handleMenuCollapse = payload => {
    if (dispatch) {
      dispatch({
        type: 'global/changeLayoutCollapsed',
        payload,
      })
    }
  }

  // get children authority
  const authorized = useMemo(
    () =>
      getMatchMenu(location.pathname || '/', menuDataRef.current).pop() || { authority: undefined },
    [location.pathname],
  )
  const { formatMessage } = useIntl()

  const removeTabs = (activeKey, action) => {
    if (action === 'remove') {
      const newTabs = [...tabs]
      let index = 0
      for (let i = 0; i < tabs.length; i += 1) {
        if (tabs[i].key === activeKey) {
          index = i
          break
        }
      }
      let openIndex = 0
      if (index === 0) {
        // 说明我们删除的是第一个标签，打开的标签应该是下一个
        openIndex = index + 1
      } else {
        openIndex = index - 1
      }
      if (openIndex >= tabs.length) {
        message.destroy()
        message.warn('请至少保留一个标签')
      } else {
        history.push(tabs[openIndex].key)
        setActiveTabKey(tabs[openIndex].key)
        setTabs(newTabs.filter(item => item.key !== activeKey))
      }
    }
  }

  const closeTabs = ({ key }) => {
    if (key === 'others') {
      setTabs(tabs.filter(item => item.key === activeTabKey))
      history.push()
    } else if (key === 'all') {
      const newTabs = tabs.filter((item, index) => index === 0)
      history.push(newTabs[0].path)
      setActiveTabKey(newTabs[0].key)
      setTabs(newTabs)
    }
  }
  return (
    <>
      <ProLayout
        style={styles}
        logo={null}
        formatMessage={formatMessage}
        {...props}
        {...settings}
        onCollapse={handleMenuCollapse}
        onMenuHeaderClick={() => history.push('/')}
        menuItemRender={(menuItemProps, defaultDom) => {
          if (
            menuItemProps.isUrl ||
            !menuItemProps.path ||
            location.pathname === menuItemProps.path
          ) {
            return defaultDom
          }

          return <Link to={menuItemProps.path}>{defaultDom}</Link>
        }}
        breadcrumbRender={(routers = []) => [
          {
            path: '/',
            breadcrumbName: formatMessage({
              id: 'menu.home',
            }),
          },
          ...routers,
        ]}
        itemRender={(route, params, routes, paths) => {
          const first = routes.indexOf(route) === 0
          return first ? (
            <Link to={paths.join('/')}>{route.breadcrumbName}</Link>
          ) : (
            <span>{route.breadcrumbName}</span>
          )
        }}
        footerRender={() => {
          if (settings.footerRender || settings.footerRender === undefined) {
            return defaultFooterDom
          }

          return null
        }}
        menuDataRender={menuDataRender}
        rightContentRender={() => <RightContent />}
        onPageChange={() => {
          const currentTab = tabs.filter(tab => tab.path === location.pathname)
          if (currentTab.length === 0) {
            const newTabs = [...tabs]
            const currentTabMenu = tabMenus.filter(tabMenu => tabMenu.path === location.pathname)
            if (currentTabMenu.length > 0) {
              newTabs.push({
                ...currentTabMenu[0],
              })
              setTabs(newTabs)
            }
          }
          setActiveTabKey(location.pathname || '')
        }}
        postMenuData={menuData => {
          menuDataRef.current = menuData || []
          return menuData || []
        }}
        waterMarkProps={{
          content: 'SUPCON',
        }}
      >
        <Authorized authority={authorized.authority} noMatch={noMatch}>
          <Tabs
            type='editable-card'
            activeKey={activeTabKey}
            hideAdd={true}
            onTabClick={activeKey => {
              setActiveTabKey(activeKey)
              history.push(activeKey)
            }}
            onEdit={(e, action) => {
              removeTabs(e, action)
            }}
            tabBarExtraContent={
              <Dropdown
                overlay={
                  <Menu onClick={e => closeTabs(e)}>
                    <Menu.Item key='others'>关闭其他</Menu.Item>
                    <Menu.Item key='all'>关闭全部</Menu.Item>
                  </Menu>
                }
                placement='bottomCenter'
              >
                <Button type='primary'>标签管理</Button>
              </Dropdown>
            }
          >
            {tabs.map(tab => (
              <Tabs.TabPane key={tab.key} tab={tab.title} />
            ))}
          </Tabs>
          {children}
        </Authorized>
      </ProLayout>
      <SettingDrawer
        settings={settings}
        onSettingChange={config =>
          dispatch({
            type: 'settings/changeSetting',
            payload: config,
          })
        }
      />
    </>
  )
}

export default connect(({ global, settings }) => ({
  collapsed: global.collapsed,
  settings,
}))(BasicLayout)
