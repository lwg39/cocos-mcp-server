"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComponentTools = void 0;
class ComponentTools {
    getTools() {
        return [
            {
                name: 'component_manage',
                description: 'COMPONENT MANAGEMENT: Add or remove built-in Cocos Creator components (cc.Sprite, cc.Button, etc.). WORKFLOW: 1) Use node_query to get nodeUuid, 2) Add components with componentType, 3) Use component_query to verify. For custom scripts use node_script_management from node-tools instead.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        action: {
                            type: 'string',
                            enum: ['add', 'remove'],
                            description: 'Component operation: "add" = attach built-in component(s) to node (requires componentType) | "remove" = detach specific component from node (requires exact CID from component_query)'
                        },
                        nodeUuid: {
                            type: 'string',
                            description: 'Target node UUID (REQUIRED). WORKFLOW: Use node_query tool to find node UUID first. Format: "12345678-abcd-1234-5678-123456789abc". Cannot add/remove components without valid node UUID.'
                        },
                        componentType: {
                            type: ['string', 'array'],
                            items: { type: 'string' },
                            description: 'Component type(s) (REQUIRED). ADD: Built-in types like "cc.Sprite", "cc.Button", "cc.Label", "cc.RichText". Can be string or array. REMOVE: Must use exact CID from component_query list (format: "cc.Sprite@12345"). Common types: cc.Sprite (images), cc.Label (text), cc.Button (clickable).'
                        }
                    },
                    required: ['action', 'nodeUuid', 'componentType']
                }
            },
            {
                name: 'component_query',
                description: 'COMPONENT QUERY: Get component information, list all components on node, or get available component types. Use this FIRST to find component CIDs before removing!',
                inputSchema: {
                    type: 'object',
                    properties: {
                        action: {
                            type: 'string',
                            enum: ['list', 'info', 'available_types'],
                            description: 'Action: "list" = get all components on node | "info" = get specific component details | "available_types" = get all available component types'
                        },
                        nodeUuid: {
                            type: 'string',
                            description: 'Node UUID (required for "list" and "info" actions). Get from node tools first!'
                        },
                        componentType: {
                            type: 'string',
                            description: 'Component type to get info for (required for "info" action). Use exact CID from list results.'
                        },
                        category: {
                            type: 'string',
                            enum: ['all', 'renderer', 'ui', 'physics', 'animation', 'audio'],
                            default: 'all',
                            description: 'Component category filter for available_types action'
                        }
                    },
                    required: ['action']
                }
            },
            {
                name: 'set_component_property',
                description: 'COMPONENT PROPERTY SETTER: Set one or more component properties. propertyType is optional: when omitted or set to "auto", the type is inferred from the Cocos property dump metadata and the supplied value. Array properties are bound with their element type and support node, asset, color, number, boolean, and string arrays.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        nodeUuid: {
                            type: 'string',
                            description: 'Target node UUID (REQUIRED). Get from node_query tool first. Format: "12345678-abcd-1234-5678-123456789abc". Must be valid scene node UUID.'
                        },
                        componentType: {
                            type: 'string',
                            description: 'Component type identifier (REQUIRED). BUILT-IN: "cc.Label", "cc.Sprite", "cc.Button", "cc.UITransform". SCRIPTS: Use compressed UUID format like "3b6be0raOhG54eGN2c5M4cN" (get from component_query). CRITICAL: Use exact type string from component_query list action!'
                        },
                        // 支持单个属性设置的旧格式（向后兼容）
                        property: {
                            type: 'string',
                            description: 'Property name for single property setting. Examples: "string" (Label text), "fontSize" (Label size), "spriteFrame" (Sprite image), "color" (visual color), "player" (script node reference). Check component_query for available properties.'
                        },
                        propertyType: {
                            type: 'string',
                            description: 'Optional property data type. Omit it or use "auto" to infer the type from the component property metadata. Explicit types remain available for ambiguous empty arrays.',
                            enum: [
                                'auto',
                                'string', 'number', 'boolean', 'integer', 'float',
                                'color', 'vec2', 'vec3', 'size',
                                'node', 'component', 'spriteFrame', 'prefab', 'asset',
                                'nodeArray', 'assetArray', 'colorArray', 'numberArray', 'booleanArray', 'stringArray'
                            ]
                        },
                        value: {
                            description: 'Property value - format depends on propertyType. STRING: "Hello World", NUMBER: 42, BOOLEAN: true/false, COLOR: {"r":255,"g":0,"b":0,"a":255} or "#FF0000", VEC2: {"x":100,"y":50}, SIZE: {"width":200,"height":100}, NODE/ASSET: "uuid-string", ARRAYS: [...values]. See examples in properties description.'
                        },
                        // 新的批量属性设置格式
                        properties: {
                            type: 'object',
                            description: 'BATCH PROPERTY SETTING: Set multiple properties simultaneously. Each property uses {"value": ...} with an optional "type"; omit type for automatic detection. Property names are case-sensitive.\n\n' +
                                '📝 FORMAT:\n' +
                                '{\n' +
                                '  "propertyName": {"type": "exactPropertyType", "value": actualValue}\n' +
                                '}\n\n' +
                                '🎯 EXAMPLES BY TYPE:\n' +
                                '• TEXT: {"string": {"type": "string", "value": "Hello World"}}\n' +
                                '• NUMBERS: {"fontSize": {"type": "number", "value": 28}}\n' +
                                '• COLORS: {"color": {"type": "color", "value": {"r":255,"g":100,"b":50,"a":255}}}\n' +
                                '• BOOLEANS: {"isBold": {"type": "boolean", "value": true}}\n' +
                                '• VECTORS: {"anchorPoint": {"type": "vec2", "value": {"x":0.5,"y":1.0}}}\n' +
                                '• SIZES: {"contentSize": {"type": "size", "value": {"width":200,"height":80}}}\n' +
                                '• NODE REFS: {"player": {"type": "node", "value": "node-uuid-here"}}\n' +
                                '• ASSETS: {"bulletPrefab": {"type": "prefab", "value": "prefab-uuid-here"}}\n' +
                                '• SPRITES: {"spriteFrame": {"type": "spriteFrame", "value": "sprite-uuid-here"}}\n\n' +
                                'ARRAY AUTO-BINDING: {"items": {"value": ["node-uuid-1", "node-uuid-2"]}}. The array element type is read from Cocos metadata. Get referenced UUIDs from asset_query or node_query first.',
                            additionalProperties: {
                                type: 'object',
                                properties: {
                                    type: {
                                        type: 'string',
                                        enum: [
                                            'auto', 'string', 'number', 'boolean', 'integer', 'float',
                                            'color', 'vec2', 'vec3', 'size',
                                            'node', 'component', 'spriteFrame', 'prefab', 'asset',
                                            'nodeArray', 'assetArray', 'colorArray', 'numberArray', 'booleanArray', 'stringArray'
                                        ]
                                    },
                                    value: {}
                                },
                                required: ['value']
                            }
                        }
                    },
                    required: ['nodeUuid', 'componentType']
                }
            },
            {
                name: 'configure_click_event',
                description: 'Configure or remove click events for Button components. Supports adding new events, removing specific events, or clearing all events.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        nodeUuid: {
                            type: 'string',
                            description: 'Target node UUID that has a Button component'
                        },
                        operation: {
                            type: 'string',
                            enum: ['add', 'modify', 'remove', 'clear'],
                            description: 'Operation type: "add" to add new event, "modify" to modify existing event, "remove" to remove specific event by index, "clear" to remove all events',
                            default: 'add'
                        },
                        targetNodeUuid: {
                            type: 'string',
                            description: 'Target node UUID that contains the script component with the callback method (required for "add" operation)'
                        },
                        componentName: {
                            type: 'string',
                            description: 'Name of the script component on target node (required for "add" operation)'
                        },
                        handlerName: {
                            type: 'string',
                            description: 'Method name to call when button is clicked (required for "add" operation)'
                        },
                        customEventData: {
                            type: 'string',
                            description: 'Optional custom event data to pass to the handler (for "add" operation)'
                        },
                        eventIndex: {
                            type: 'number',
                            description: 'Index of the specific event to remove (0-based, required for "remove" operation)'
                        }
                    },
                    required: ['nodeUuid']
                }
            }
        ];
    }
    async execute(toolName, args) {
        switch (toolName) {
            case 'component_manage':
                return await this.handleComponentManage(args);
            case 'component_query':
                return await this.handleComponentQuery(args);
            case 'set_component_property':
                return await this.setComponentProperties(args);
            case 'configure_click_event':
                return await this.configureClickEvent(args);
            // 向后兼容性支持
            case 'add_component':
                return await this.addComponents(args.nodeUuid, args.componentType);
            case 'remove_component':
                return await this.removeComponent(args.nodeUuid, args.componentType);
            case 'get_components':
                return await this.getComponents(args.nodeUuid);
            case 'get_component_info':
                return await this.getComponentInfo(args.nodeUuid, args.componentType);
            case 'get_available_components':
                return await this.getAvailableComponents(args.category);
            default:
                throw new Error(`Unknown tool: ${toolName}`);
        }
    }
    // 新的整合处理函数
    async handleComponentManage(args) {
        const { action, nodeUuid, componentType } = args;
        switch (action) {
            case 'add':
                return await this.addComponents(nodeUuid, componentType);
            case 'remove':
                return await this.removeComponent(nodeUuid, componentType);
            default:
                return { success: false, error: `Unknown component manage action: ${action}` };
        }
    }
    async handleComponentQuery(args) {
        const { action, nodeUuid, componentType, category } = args;
        switch (action) {
            case 'list':
                return await this.getComponents(nodeUuid);
            case 'info':
                return await this.getComponentInfo(nodeUuid, componentType);
            case 'available_types':
                return await this.getAvailableComponents(category || 'all');
            default:
                return { success: false, error: `Unknown query action: ${action}` };
        }
    }
    /**
     * 获取组件添加成功后的特定提醒信息
     */
    getComponentReminder(componentType) {
        const reminders = {
            'cc.Sprite': 'REMINDER: Set "spriteFrame" property to display the sprite. Use set_component_property to assign a sprite frame asset.',
            'cc.Label': 'REMINDER: Set "string" property to display text content. Example: {"string": {"type": "string", "value": "Hello World"}}',
            'cc.Button': 'REMINDER: Configure click events using configure_click_event tool. Also consider setting "normalColor", "pressedColor" and "transition" properties.',
            'cc.EditBox': 'REMINDER: Set "string" property for placeholder text and configure "backgroundImage" for visual styling.',
            'cc.ProgressBar': 'REMINDER: Set "totalLength" and "progress" properties to make the progress bar functional.',
            'cc.Slider': 'REMINDER: Set "progress" property (0-1 range) and configure "handle" and "background" sprites.',
            'cc.ScrollView': 'REMINDER: Configure "content" node and set "horizontal" or "vertical" scroll directions.',
            'cc.PageView': 'REMINDER: Add child nodes as pages and set "direction" property (horizontal/vertical).',
            'cc.Toggle': 'REMINDER: Set "isChecked" property and configure "checkMark" sprite for visual feedback.',
            'cc.ToggleGroup': 'REMINDER: Assign toggle components to this group and set "allowSwitchOff" if needed.'
        };
        return reminders[componentType] || '';
    }
    async addComponents(nodeUuid, componentTypes) {
        // 将输入标准化为数组
        const typesToAdd = Array.isArray(componentTypes) ? componentTypes : [componentTypes];
        if (typesToAdd.length === 0) {
            return { success: false, error: 'No component types provided' };
        }
        // 如果只有一个组件，使用原有的单个组件添加逻辑
        if (typesToAdd.length === 1) {
            return await this.addComponent(nodeUuid, typesToAdd[0]);
        }
        // 批量添加多个组件
        return await this.addMultipleComponents(nodeUuid, typesToAdd);
    }
    async addMultipleComponents(nodeUuid, componentTypes) {
        const results = [];
        const errors = [];
        let successCount = 0;
        for (const componentType of componentTypes) {
            try {
                const result = await this.addComponent(nodeUuid, componentType);
                results.push({
                    componentType,
                    success: result.success,
                    message: result.message,
                    error: result.error
                });
                if (result.success) {
                    successCount++;
                }
                else {
                    errors.push(`${componentType}: ${result.error}`);
                }
            }
            catch (err) {
                const errorMsg = `${componentType}: ${err.message}`;
                errors.push(errorMsg);
                results.push({
                    componentType,
                    success: false,
                    error: errorMsg
                });
            }
        }
        const totalRequested = componentTypes.length;
        const isFullSuccess = successCount === totalRequested;
        return {
            success: isFullSuccess,
            message: isFullSuccess
                ? `Successfully added all ${successCount} components`
                : `Added ${successCount} of ${totalRequested} components`,
            data: {
                nodeUuid,
                totalRequested,
                totalAdded: successCount,
                results,
                errors: errors.length > 0 ? errors : undefined
            }
        };
    }
    async addComponent(nodeUuid, componentType) {
        var _a, _b;
        // 先查找节点上是否已存在该组件
        const allComponentsInfo = await this.getComponents(nodeUuid);
        if (allComponentsInfo.success && ((_a = allComponentsInfo.data) === null || _a === void 0 ? void 0 : _a.components)) {
            const existingComponent = allComponentsInfo.data.components.find((comp) => comp.type === componentType);
            if (existingComponent) {
                const reminder = this.getComponentReminder(componentType);
                const message = reminder
                    ? `Component '${componentType}' already exists on node. ${reminder}`
                    : `Component '${componentType}' already exists on node`;
                return {
                    success: true,
                    message: message,
                    data: {
                        nodeUuid: nodeUuid,
                        componentType: componentType,
                        componentVerified: true,
                        existing: true
                    }
                };
            }
        }
        // 尝试直接使用 Editor API 添加组件
        try {
            await Editor.Message.request('scene', 'create-component', {
                uuid: nodeUuid,
                component: componentType
            });
            // 等待一段时间让Editor完成组件添加
            await new Promise(resolve => setTimeout(resolve, 100));
            // 重新查询节点信息验证组件是否真的添加成功
            try {
                const allComponentsInfo2 = await this.getComponents(nodeUuid);
                if (allComponentsInfo2.success && ((_b = allComponentsInfo2.data) === null || _b === void 0 ? void 0 : _b.components)) {
                    const addedComponent = allComponentsInfo2.data.components.find((comp) => comp.type === componentType);
                    if (addedComponent) {
                        const reminder = this.getComponentReminder(componentType);
                        const message = reminder
                            ? `Component '${componentType}' added successfully. ${reminder}`
                            : `Component '${componentType}' added successfully`;
                        return {
                            success: true,
                            message: message,
                            data: {
                                nodeUuid: nodeUuid,
                                componentType: componentType,
                                componentVerified: true,
                                existing: false
                            }
                        };
                    }
                    else {
                        return {
                            success: false,
                            error: `Component '${componentType}' was not found on node after addition. Available components: ${allComponentsInfo2.data.components.map((c) => c.type).join(', ')}`
                        };
                    }
                }
                else {
                    return {
                        success: false,
                        error: `Failed to verify component addition: ${allComponentsInfo2.error || 'Unable to get node components'}`
                    };
                }
            }
            catch (verifyError) {
                return {
                    success: false,
                    error: `Failed to verify component addition: ${verifyError.message}`
                };
            }
        }
        catch (err) {
            // 备用方案：使用场景脚本
            const options = {
                name: 'cocos-mcp-server',
                method: 'addComponentToNode',
                args: [nodeUuid, componentType]
            };
            try {
                const result = await Editor.Message.request('scene', 'execute-scene-script', options);
                return result;
            }
            catch (err2) {
                return { success: false, error: `Direct API failed: ${err.message}, Scene script failed: ${err2.message}` };
            }
        }
    }
    async removeComponent(nodeUuid, componentType) {
        var _a, _b, _c, _d, _e;
        // 1. 查找节点上的所有组件
        const allComponentsInfo = await this.getComponents(nodeUuid);
        if (!allComponentsInfo.success || !((_a = allComponentsInfo.data) === null || _a === void 0 ? void 0 : _a.components)) {
            return { success: false, error: `Failed to get components for node '${nodeUuid}': ${allComponentsInfo.error}` };
        }
        // 2. 查找type字段等于componentType的组件索引
        const componentIndex = allComponentsInfo.data.components.findIndex((comp) => comp.type === componentType);
        if (componentIndex === -1) {
            return { success: false, error: `Component cid '${componentType}' not found on node '${nodeUuid}'. 请用getComponents获取type字段（cid）作为componentType。` };
        }
        // 3. 尝试多种API方法移除组件
        try {
            console.log(`Attempting to remove component at index ${componentIndex} (type: ${componentType}) from node ${nodeUuid}`);
            let removeSuccessful = false;
            // 方法1: 使用remove-array-element API（基于消息日志）
            try {
                await Editor.Message.request('scene', 'remove-array-element', {
                    uuid: nodeUuid,
                    path: '__comps__',
                    index: componentIndex
                });
                removeSuccessful = true;
            }
            catch (removeError) {
                console.log(`remove-array-element failed:`, removeError);
            }
            // 方法2: 尝试delete-component API
            if (!removeSuccessful) {
                try {
                    await Editor.Message.request('scene', 'delete-component', {
                        uuid: nodeUuid,
                        component: componentType
                    });
                    removeSuccessful = true;
                }
                catch (deleteError) {
                    console.log(`delete-component failed:`, deleteError);
                }
            }
            // 方法3: 备用方案 - 使用原始remove-component API但使用索引
            if (!removeSuccessful) {
                try {
                    await Editor.Message.request('scene', 'remove-component', {
                        uuid: nodeUuid,
                        component: componentIndex
                    });
                    removeSuccessful = true;
                }
                catch (removeError2) {
                    console.log(`remove-component with index failed:`, removeError2);
                }
            }
            // 方法4: 尝试使用类型名的remove-component API（原始代码）
            if (!removeSuccessful) {
                try {
                    await Editor.Message.request('scene', 'remove-component', {
                        uuid: nodeUuid,
                        component: componentType
                    });
                    removeSuccessful = true;
                }
                catch (removeError3) {
                    console.log(`remove-component with type failed:`, removeError3);
                }
            }
            // 4. 再查一次确认是否移除
            const afterRemoveInfo = await this.getComponents(nodeUuid);
            const stillExists = afterRemoveInfo.success && ((_c = (_b = afterRemoveInfo.data) === null || _b === void 0 ? void 0 : _b.components) === null || _c === void 0 ? void 0 : _c.some((comp) => comp.type === componentType));
            console.log(`After removal - components count: ${(_e = (_d = afterRemoveInfo.data) === null || _d === void 0 ? void 0 : _d.components) === null || _e === void 0 ? void 0 : _e.length}, still exists: ${stillExists}`);
            if (stillExists) {
                return { success: false, error: `Component cid '${componentType}' was not removed from node '${nodeUuid}'. Index used: ${componentIndex}` };
            }
            else {
                return {
                    success: true,
                    message: `✅ Component '${componentType}' removed`,
                    data: { nodeUuid, componentType, removedIndex: componentIndex }
                };
            }
        }
        catch (err) {
            console.log(`Remove component error:`, err);
            return { success: false, error: `Failed to remove component: ${err.message}` };
        }
    }
    async getComponents(nodeUuid) {
        // 优先尝试直接使用 Editor API 查询节点信息
        try {
            const nodeData = await Editor.Message.request('scene', 'query-node', nodeUuid);
            if (nodeData && nodeData.__comps__) {
                const components = nodeData.__comps__.map((comp) => {
                    var _a;
                    return ({
                        type: comp.__type__ || comp.cid || comp.type || 'Unknown',
                        uuid: ((_a = comp.uuid) === null || _a === void 0 ? void 0 : _a.value) || comp.uuid || null,
                        enabled: comp.enabled !== undefined ? comp.enabled : true,
                        properties: this.extractComponentProperties(comp)
                    });
                });
                return {
                    success: true,
                    data: {
                        nodeUuid: nodeUuid,
                        components: components
                    }
                };
            }
            else {
                return { success: false, error: 'Node not found or no components data' };
            }
        }
        catch (err) {
            // 备用方案：使用场景脚本
            const options = {
                name: 'cocos-mcp-server',
                method: 'getNodeInfo',
                args: [nodeUuid]
            };
            try {
                const result = await Editor.Message.request('scene', 'execute-scene-script', options);
                if (result.success) {
                    return {
                        success: true,
                        data: result.data.components
                    };
                }
                else {
                    return result;
                }
            }
            catch (err2) {
                return { success: false, error: `Direct API failed: ${err.message}, Scene script failed: ${err2.message}` };
            }
        }
    }
    async getComponentInfo(nodeUuid, componentType) {
        // 优先尝试直接使用 Editor API 查询节点信息
        try {
            const nodeData = await Editor.Message.request('scene', 'query-node', nodeUuid);
            if (nodeData && nodeData.__comps__) {
                const component = nodeData.__comps__.find((comp) => {
                    const compType = comp.__type__ || comp.cid || comp.type;
                    return compType === componentType;
                });
                if (component) {
                    return {
                        success: true,
                        data: {
                            nodeUuid: nodeUuid,
                            componentType: componentType,
                            enabled: component.enabled !== undefined ? component.enabled : true,
                            properties: this.extractComponentProperties(component)
                        }
                    };
                }
                else {
                    return { success: false, error: `Component '${componentType}' not found on node` };
                }
            }
            else {
                return { success: false, error: 'Node not found or no components data' };
            }
        }
        catch (err) {
            // 备用方案：使用场景脚本
            const options = {
                name: 'cocos-mcp-server',
                method: 'getNodeInfo',
                args: [nodeUuid]
            };
            try {
                const result = await Editor.Message.request('scene', 'execute-scene-script', options);
                if (result.success && result.data.components) {
                    const component = result.data.components.find((comp) => comp.type === componentType);
                    if (component) {
                        return {
                            success: true,
                            data: Object.assign({ nodeUuid: nodeUuid, componentType: componentType }, component)
                        };
                    }
                    else {
                        return { success: false, error: `Component '${componentType}' not found on node` };
                    }
                }
                else {
                    return { success: false, error: result.error || 'Failed to get component info' };
                }
            }
            catch (err2) {
                return { success: false, error: `Direct API failed: ${err.message}, Scene script failed: ${err2.message}` };
            }
        }
    }
    extractComponentProperties(component) {
        console.log(`[extractComponentProperties] Processing component:`, Object.keys(component));
        // 检查组件是否有 value 属性，这通常包含实际的组件属性
        if (component.value && typeof component.value === 'object') {
            console.log(`[extractComponentProperties] Found component.value with properties:`, Object.keys(component.value));
            return component.value; // 直接返回 value 对象，它包含所有组件属性
        }
        // 备用方案：从组件对象中直接提取属性
        const properties = {};
        const excludeKeys = ['__type__', 'enabled', 'node', '_id', '__scriptAsset', 'uuid', 'name', '_name', '_objFlags', '_enabled', 'type', 'readonly', 'visible', 'cid', 'editor', 'extends'];
        for (const key in component) {
            if (!excludeKeys.includes(key) && !key.startsWith('_')) {
                console.log(`[extractComponentProperties] Found direct property '${key}':`, typeof component[key]);
                properties[key] = component[key];
            }
        }
        console.log(`[extractComponentProperties] Final extracted properties:`, Object.keys(properties));
        return properties;
    }
    async findComponentTypeByUuid(componentUuid) {
        var _a;
        console.log(`[findComponentTypeByUuid] Searching for component type with UUID: ${componentUuid}`);
        if (!componentUuid) {
            return null;
        }
        try {
            const nodeTree = await Editor.Message.request('scene', 'query-node-tree');
            if (!nodeTree) {
                console.warn('[findComponentTypeByUuid] Failed to query node tree.');
                return null;
            }
            const queue = [nodeTree];
            while (queue.length > 0) {
                const currentNodeInfo = queue.shift();
                if (!currentNodeInfo || !currentNodeInfo.uuid) {
                    continue;
                }
                try {
                    const fullNodeData = await Editor.Message.request('scene', 'query-node', currentNodeInfo.uuid);
                    if (fullNodeData && fullNodeData.__comps__) {
                        for (const comp of fullNodeData.__comps__) {
                            const compAny = comp; // Cast to any to access dynamic properties
                            // The component UUID is nested in the 'value' property
                            if (compAny.uuid && compAny.uuid.value === componentUuid) {
                                const componentType = compAny.__type__;
                                console.log(`[findComponentTypeByUuid] Found component type '${componentType}' for UUID ${componentUuid} on node ${(_a = fullNodeData.name) === null || _a === void 0 ? void 0 : _a.value}`);
                                return componentType;
                            }
                        }
                    }
                }
                catch (e) {
                    console.warn(`[findComponentTypeByUuid] Could not query node ${currentNodeInfo.uuid}:`, e);
                }
                if (currentNodeInfo.children) {
                    for (const child of currentNodeInfo.children) {
                        queue.push(child);
                    }
                }
            }
            console.warn(`[findComponentTypeByUuid] Component with UUID ${componentUuid} not found in scene tree.`);
            return null;
        }
        catch (error) {
            console.error(`[findComponentTypeByUuid] Error while searching for component type:`, error);
            return null;
        }
    }
    async setComponentProperties(args) {
        // 检查是单个属性设置还是批量属性设置
        if (args.properties) {
            // 批量属性设置
            return await this.setMultipleComponentProperties(args);
        }
        else if (args.property && args.value !== undefined) {
            // 单个属性设置；propertyType 缺省时自动检测
            return await this.setComponentProperty(args);
        }
        else {
            return {
                success: false,
                error: 'Invalid parameters. Use either single property format (property, value, optional propertyType) or batch format (properties).'
            };
        }
    }
    async setMultipleComponentProperties(args) {
        const { nodeUuid, componentType, properties } = args;
        if (!properties || typeof properties !== 'object') {
            return {
                success: false,
                error: 'Properties parameter must be an object with property definitions'
            };
        }
        const results = [];
        const errors = [];
        let successCount = 0;
        const propertyNames = Object.keys(properties);
        for (const propertyName of propertyNames) {
            const propertyDef = properties[propertyName];
            const isDefinition = propertyDef !== null && typeof propertyDef === 'object' &&
                !Array.isArray(propertyDef) && Object.prototype.hasOwnProperty.call(propertyDef, 'value');
            const propertyValue = isDefinition ? propertyDef.value : propertyDef;
            const propertyType = isDefinition ? propertyDef.type : undefined;
            if (propertyValue === undefined) {
                const error = `Property '${propertyName}' must have a value`;
                errors.push(error);
                results.push({
                    property: propertyName,
                    success: false,
                    error
                });
                continue;
            }
            try {
                const result = await this.setComponentProperty({
                    nodeUuid,
                    componentType,
                    property: propertyName,
                    propertyType,
                    value: propertyValue
                });
                results.push({
                    property: propertyName,
                    success: result.success,
                    message: result.message,
                    error: result.error
                });
                if (result.success) {
                    successCount++;
                }
                else {
                    errors.push(`${propertyName}: ${result.error}`);
                }
            }
            catch (err) {
                const errorMsg = `${propertyName}: ${err.message}`;
                errors.push(errorMsg);
                results.push({
                    property: propertyName,
                    success: false,
                    error: errorMsg
                });
            }
        }
        const totalRequested = propertyNames.length;
        const isFullSuccess = successCount === totalRequested;
        return {
            success: isFullSuccess,
            message: isFullSuccess
                ? `Successfully set all ${successCount} properties`
                : `Set ${successCount} of ${totalRequested} properties`,
            data: {
                nodeUuid,
                componentType,
                totalRequested,
                totalSet: successCount,
                results,
                errors: errors.length > 0 ? errors : undefined
            }
        };
    }
    async setComponentProperty(args) {
        var _a, _b;
        const { nodeUuid, componentType, property, propertyType, value } = args;
        try {
            console.log(`[ComponentTools] Setting ${componentType}.${property} (type: ${propertyType}) = ${JSON.stringify(value)} on node ${nodeUuid}`);
            // Step 0: 检测是否为节点属性，如果是则重定向到对应的节点方法
            const nodeRedirectResult = await this.checkAndRedirectNodeProperties(args);
            if (nodeRedirectResult) {
                return nodeRedirectResult;
            }
            // Step 1: 获取组件信息，使用与getComponents相同的方法
            const componentsResponse = await this.getComponents(nodeUuid);
            if (!componentsResponse.success || !componentsResponse.data) {
                return {
                    success: false,
                    error: `Failed to get components for node '${nodeUuid}': ${componentsResponse.error}`,
                    instruction: `Please verify that node UUID '${nodeUuid}' is correct. Use get_all_nodes or find_node_by_name to get the correct node UUID.`
                };
            }
            const allComponents = componentsResponse.data.components;
            // Step 2: 查找目标组件
            let targetComponent = null;
            const availableTypes = [];
            for (let i = 0; i < allComponents.length; i++) {
                const comp = allComponents[i];
                availableTypes.push(comp.type);
                if (comp.type === componentType) {
                    targetComponent = comp;
                    break;
                }
            }
            if (!targetComponent) {
                // 提供更详细的错误信息和建议
                const instruction = this.generateComponentSuggestion(componentType, availableTypes, property);
                return {
                    success: false,
                    error: `Component '${componentType}' not found on node. Available components: ${availableTypes.join(', ')}`,
                    instruction: instruction
                };
            }
            // Step 3: 自动检测和转换属性值
            let propertyInfo;
            try {
                console.log(`[ComponentTools] Analyzing property: ${property}`);
                propertyInfo = this.analyzeProperty(targetComponent, property);
            }
            catch (analyzeError) {
                console.error(`[ComponentTools] Error in analyzeProperty:`, analyzeError);
                return {
                    success: false,
                    error: `Failed to analyze property '${property}': ${analyzeError.message}`
                };
            }
            if (!propertyInfo.exists) {
                return {
                    success: false,
                    error: `Property '${property}' not found on component '${componentType}'. Available properties: ${propertyInfo.availableProperties.join(', ')}`
                };
            }
            // Step 4: 处理属性值和设置
            const originalValue = propertyInfo.originalValue;
            let processedValue;
            const finalPropertyType = !propertyType || propertyType === 'auto'
                ? this.autoDetectPropertyType(property, value, originalValue, propertyInfo.type, propertyInfo.metadata)
                : propertyType;
            // 根据明确的propertyType处理属性值
            switch (finalPropertyType) {
                case 'string':
                    processedValue = String(value);
                    break;
                case 'number':
                case 'integer':
                case 'float':
                    processedValue = Number(value);
                    break;
                case 'boolean':
                    processedValue = Boolean(value);
                    break;
                case 'color':
                    if (typeof value === 'string') {
                        // 字符串格式：支持十六进制、颜色名称、rgb()/rgba()
                        processedValue = this.parseColorString(value);
                    }
                    else if (typeof value === 'object' && value !== null) {
                        // 对象格式：验证并转换RGBA值
                        processedValue = {
                            r: Math.min(255, Math.max(0, Number(value.r) || 0)),
                            g: Math.min(255, Math.max(0, Number(value.g) || 0)),
                            b: Math.min(255, Math.max(0, Number(value.b) || 0)),
                            a: value.a !== undefined ? Math.min(255, Math.max(0, Number(value.a))) : 255
                        };
                    }
                    else {
                        throw new Error(`Color value must be an object with r, g, b properties or a hexadecimal string. Expected: {"r":255,"g":0,"b":0,"a":255} or "#FF0000", but received: ${JSON.stringify(value)} (${typeof value})`);
                    }
                    break;
                case 'vec2':
                    if (typeof value === 'object' && value !== null && 'x' in value && 'y' in value) {
                        processedValue = {
                            x: Number(value.x) || 0,
                            y: Number(value.y) || 0
                        };
                    }
                    else {
                        throw new Error(`Vec2 value must be an object with x, y properties. Expected: {"x":100,"y":50}, but received: ${JSON.stringify(value)} (${typeof value})`);
                    }
                    break;
                case 'vec3':
                    if (typeof value === 'object' && value !== null && 'x' in value && 'y' in value && 'z' in value) {
                        processedValue = {
                            x: Number(value.x) || 0,
                            y: Number(value.y) || 0,
                            z: Number(value.z) || 0
                        };
                    }
                    else {
                        throw new Error(`Vec3 value must be an object with x, y, z properties. Expected: {"x":1,"y":2,"z":3}, but received: ${JSON.stringify(value)} (${typeof value})`);
                    }
                    break;
                case 'size':
                    if (typeof value === 'object' && value !== null) {
                        if ('width' in value && 'height' in value) {
                            processedValue = {
                                width: Number(value.width) || 0,
                                height: Number(value.height) || 0
                            };
                        }
                        else {
                            throw new Error(`Size value must be an object with width, height properties. Expected: {"width":100,"height":50}, but received: ${JSON.stringify(value)}`);
                        }
                    }
                    else {
                        throw new Error(`Size value must be an object with width, height properties. Expected: {"width":100,"height":50}, but received: ${JSON.stringify(value)} (${typeof value})`);
                    }
                    break;
                case 'node':
                    if (typeof value === 'string') {
                        processedValue = { uuid: value };
                    }
                    else {
                        throw new Error('Node reference value must be a string UUID');
                    }
                    break;
                case 'component':
                    if (typeof value === 'string') {
                        // 组件引用需要特殊处理：通过节点UUID找到组件的__id__
                        processedValue = value; // 先保存节点UUID，后续会转换为__id__
                    }
                    else {
                        throw new Error('Component reference value must be a string (node UUID containing the target component)');
                    }
                    break;
                case 'spriteFrame':
                case 'prefab':
                case 'asset':
                    if (typeof value === 'string') {
                        processedValue = { uuid: value };
                    }
                    else {
                        throw new Error(`${finalPropertyType} value must be a string UUID`);
                    }
                    break;
                case 'nodeArray':
                    if (Array.isArray(value)) {
                        processedValue = value.map((item) => {
                            if (typeof item === 'string') {
                                return { uuid: item };
                            }
                            else if (item && typeof item === 'object' && typeof item.uuid === 'string') {
                                return { uuid: item.uuid };
                            }
                            else {
                                throw new Error('NodeArray items must be UUID strings or {uuid} objects');
                            }
                        });
                    }
                    else {
                        throw new Error('NodeArray value must be an array');
                    }
                    break;
                case 'assetArray':
                    if (Array.isArray(value)) {
                        processedValue = value.map((item) => {
                            if (typeof item === 'string')
                                return { uuid: item };
                            if (item && typeof item === 'object' && typeof item.uuid === 'string')
                                return { uuid: item.uuid };
                            throw new Error('AssetArray items must be UUID strings or {uuid} objects');
                        });
                    }
                    else {
                        throw new Error('AssetArray value must be an array');
                    }
                    break;
                case 'colorArray':
                    if (Array.isArray(value)) {
                        processedValue = value.map((item) => {
                            if (typeof item === 'object' && item !== null && 'r' in item) {
                                return {
                                    r: Math.min(255, Math.max(0, Number(item.r) || 0)),
                                    g: Math.min(255, Math.max(0, Number(item.g) || 0)),
                                    b: Math.min(255, Math.max(0, Number(item.b) || 0)),
                                    a: item.a !== undefined ? Math.min(255, Math.max(0, Number(item.a))) : 255
                                };
                            }
                            else {
                                return { r: 255, g: 255, b: 255, a: 255 };
                            }
                        });
                    }
                    else {
                        throw new Error('ColorArray value must be an array');
                    }
                    break;
                case 'numberArray':
                    if (Array.isArray(value)) {
                        processedValue = value.map((item) => Number(item));
                    }
                    else {
                        throw new Error('NumberArray value must be an array');
                    }
                    break;
                case 'booleanArray':
                    if (Array.isArray(value)) {
                        processedValue = value.map((item) => {
                            if (typeof item === 'string')
                                return item.toLowerCase() === 'true' || item === '1';
                            return Boolean(item);
                        });
                    }
                    else {
                        throw new Error('BooleanArray value must be an array');
                    }
                    break;
                case 'stringArray':
                    if (Array.isArray(value)) {
                        processedValue = value.map((item) => String(item));
                    }
                    else {
                        throw new Error('StringArray value must be an array');
                    }
                    break;
                default:
                    throw new Error(`Unsupported property type: ${finalPropertyType}`);
            }
            console.log(`[ComponentTools] Converting value: ${JSON.stringify(value)} -> ${JSON.stringify(processedValue)} (type: ${finalPropertyType})`);
            console.log(`[ComponentTools] Property analysis result: propertyInfo.type="${propertyInfo.type}", propertyType="${finalPropertyType}"`);
            console.log(`[ComponentTools] Will use color special handling: ${finalPropertyType === 'color' && processedValue && typeof processedValue === 'object'}`);
            // 用于验证的实际期望值（对于组件引用需要特殊处理）
            let actualExpectedValue = processedValue;
            // Step 5: 获取原始节点数据来构建正确的路径
            const rawNodeData = await Editor.Message.request('scene', 'query-node', nodeUuid);
            if (!rawNodeData || !rawNodeData.__comps__) {
                return {
                    success: false,
                    error: `Failed to get raw node data for property setting`
                };
            }
            // 找到原始组件的索引
            let rawComponentIndex = -1;
            for (let i = 0; i < rawNodeData.__comps__.length; i++) {
                const comp = rawNodeData.__comps__[i];
                const compType = comp.__type__ || comp.cid || comp.type || 'Unknown';
                if (compType === componentType) {
                    rawComponentIndex = i;
                    break;
                }
            }
            if (rawComponentIndex === -1) {
                return {
                    success: false,
                    error: `Could not find component index for setting property`
                };
            }
            // 构建正确的属性路径
            let propertyPath = `__comps__.${rawComponentIndex}.${property}`;
            // 特殊处理资源类属性
            if (finalPropertyType === 'asset' || finalPropertyType === 'spriteFrame' || finalPropertyType === 'prefab' ||
                (propertyInfo.type === 'asset' && finalPropertyType === 'string')) {
                console.log(`[ComponentTools] Setting asset reference:`, {
                    value: processedValue,
                    property: property,
                    propertyType: finalPropertyType,
                    path: propertyPath
                });
                // Determine asset type based on property name
                let assetType = 'cc.SpriteFrame'; // default
                if (property.toLowerCase().includes('texture')) {
                    assetType = 'cc.Texture2D';
                }
                else if (property.toLowerCase().includes('material')) {
                    assetType = 'cc.Material';
                }
                else if (property.toLowerCase().includes('font')) {
                    assetType = 'cc.Font';
                }
                else if (property.toLowerCase().includes('clip')) {
                    assetType = 'cc.AudioClip';
                }
                else if (finalPropertyType === 'prefab') {
                    assetType = 'cc.Prefab';
                }
                await Editor.Message.request('scene', 'set-property', {
                    uuid: nodeUuid,
                    path: propertyPath,
                    dump: {
                        value: processedValue,
                        type: assetType
                    }
                });
            }
            else if (componentType === 'cc.UITransform' && (property === '_contentSize' || property === 'contentSize')) {
                // Special handling for UITransform contentSize - set width and height separately
                // FIXED: Use proper null checking instead of || which treats 0 as falsy
                const width = value.width !== undefined ? Number(value.width) : 100;
                const height = value.height !== undefined ? Number(value.height) : 100;
                // Set width first
                await Editor.Message.request('scene', 'set-property', {
                    uuid: nodeUuid,
                    path: `__comps__.${rawComponentIndex}.width`,
                    dump: { value: width }
                });
                // Then set height
                await Editor.Message.request('scene', 'set-property', {
                    uuid: nodeUuid,
                    path: `__comps__.${rawComponentIndex}.height`,
                    dump: { value: height }
                });
            }
            else if (componentType === 'cc.UITransform' && (property === '_anchorPoint' || property === 'anchorPoint')) {
                // Special handling for UITransform anchorPoint - set anchorX and anchorY separately
                // FIXED: Use proper null checking instead of || which treats 0 as falsy
                const anchorX = value.x !== undefined ? Number(value.x) : 0.5;
                const anchorY = value.y !== undefined ? Number(value.y) : 0.5;
                // Set anchorX first
                await Editor.Message.request('scene', 'set-property', {
                    uuid: nodeUuid,
                    path: `__comps__.${rawComponentIndex}.anchorX`,
                    dump: { value: anchorX }
                });
                // Then set anchorY  
                await Editor.Message.request('scene', 'set-property', {
                    uuid: nodeUuid,
                    path: `__comps__.${rawComponentIndex}.anchorY`,
                    dump: { value: anchorY }
                });
            }
            else if (finalPropertyType === 'color' && processedValue && typeof processedValue === 'object') {
                // 特殊处理颜色属性，确保RGBA值正确
                // Cocos Creator颜色值范围是0-255
                const colorValue = {
                    r: Math.min(255, Math.max(0, Number(processedValue.r) || 0)),
                    g: Math.min(255, Math.max(0, Number(processedValue.g) || 0)),
                    b: Math.min(255, Math.max(0, Number(processedValue.b) || 0)),
                    a: processedValue.a !== undefined ? Math.min(255, Math.max(0, Number(processedValue.a))) : 255
                };
                console.log(`[ComponentTools] Setting color value:`, colorValue);
                await Editor.Message.request('scene', 'set-property', {
                    uuid: nodeUuid,
                    path: propertyPath,
                    dump: {
                        value: colorValue,
                        type: 'cc.Color'
                    }
                });
            }
            else if (finalPropertyType === 'vec3' && processedValue && typeof processedValue === 'object') {
                // 特殊处理Vec3属性
                const vec3Value = {
                    x: Number(processedValue.x) || 0,
                    y: Number(processedValue.y) || 0,
                    z: Number(processedValue.z) || 0
                };
                await Editor.Message.request('scene', 'set-property', {
                    uuid: nodeUuid,
                    path: propertyPath,
                    dump: {
                        value: vec3Value,
                        type: 'cc.Vec3'
                    }
                });
            }
            else if (finalPropertyType === 'vec2' && processedValue && typeof processedValue === 'object') {
                // 特殊处理Vec2属性
                const vec2Value = {
                    x: Number(processedValue.x) || 0,
                    y: Number(processedValue.y) || 0
                };
                await Editor.Message.request('scene', 'set-property', {
                    uuid: nodeUuid,
                    path: propertyPath,
                    dump: {
                        value: vec2Value,
                        type: 'cc.Vec2'
                    }
                });
            }
            else if (finalPropertyType === 'size' && processedValue && typeof processedValue === 'object') {
                // 特殊处理Size属性
                const sizeValue = {
                    width: Number(processedValue.width) || 0,
                    height: Number(processedValue.height) || 0
                };
                await Editor.Message.request('scene', 'set-property', {
                    uuid: nodeUuid,
                    path: propertyPath,
                    dump: {
                        value: sizeValue,
                        type: 'cc.Size'
                    }
                });
            }
            else if (finalPropertyType === 'node' && processedValue && typeof processedValue === 'object' && 'uuid' in processedValue) {
                // 特殊处理节点引用
                console.log(`[ComponentTools] Setting node reference with UUID: ${processedValue.uuid}`);
                await Editor.Message.request('scene', 'set-property', {
                    uuid: nodeUuid,
                    path: propertyPath,
                    dump: {
                        value: processedValue,
                        type: 'cc.Node'
                    }
                });
            }
            else if (finalPropertyType === 'component' && typeof processedValue === 'string') {
                // 特殊处理组件引用：通过节点UUID找到组件的__id__
                const targetNodeUuid = processedValue;
                console.log(`[ComponentTools] Setting component reference - finding component on node: ${targetNodeUuid}`);
                // 从当前组件的属性元数据中获取期望的组件类型
                let expectedComponentType = '';
                // 获取当前组件的详细信息，包括属性元数据
                const currentComponentInfo = await this.getComponentInfo(nodeUuid, componentType);
                if (currentComponentInfo.success && ((_b = (_a = currentComponentInfo.data) === null || _a === void 0 ? void 0 : _a.properties) === null || _b === void 0 ? void 0 : _b[property])) {
                    const propertyMeta = currentComponentInfo.data.properties[property];
                    // 从属性元数据中提取组件类型信息
                    if (propertyMeta && typeof propertyMeta === 'object') {
                        // 检查是否有type字段指示组件类型
                        if (propertyMeta.type) {
                            expectedComponentType = propertyMeta.type;
                        }
                        else if (propertyMeta.ctor) {
                            // 有些属性可能使用ctor字段
                            expectedComponentType = propertyMeta.ctor;
                        }
                        else if (propertyMeta.extends && Array.isArray(propertyMeta.extends)) {
                            // 检查extends数组，通常第一个是最具体的类型
                            for (const extendType of propertyMeta.extends) {
                                if (extendType.startsWith('cc.') && extendType !== 'cc.Component' && extendType !== 'cc.Object') {
                                    expectedComponentType = extendType;
                                    break;
                                }
                            }
                        }
                    }
                }
                if (!expectedComponentType) {
                    throw new Error(`Unable to determine required component type for property '${property}' on component '${componentType}'. Property metadata may not contain type information.`);
                }
                console.log(`[ComponentTools] Detected required component type: ${expectedComponentType} for property: ${property}`);
                try {
                    // 获取目标节点的组件信息
                    const targetNodeData = await Editor.Message.request('scene', 'query-node', targetNodeUuid);
                    if (!targetNodeData || !targetNodeData.__comps__) {
                        throw new Error(`Target node ${targetNodeUuid} not found or has no components`);
                    }
                    // 打印目标节点的组件概览
                    console.log(`[ComponentTools] Target node ${targetNodeUuid} has ${targetNodeData.__comps__.length} components:`);
                    targetNodeData.__comps__.forEach((comp, index) => {
                        const sceneId = comp.value && comp.value.uuid && comp.value.uuid.value ? comp.value.uuid.value : 'unknown';
                        console.log(`[ComponentTools] Component ${index}: ${comp.type} (scene_id: ${sceneId})`);
                    });
                    // 查找对应的组件
                    let targetComponent = null;
                    let componentId = null;
                    // 在目标节点的_components数组中查找指定类型的组件
                    // 注意：__comps__和_components的索引是对应的
                    console.log(`[ComponentTools] Searching for component type: ${expectedComponentType}`);
                    for (let i = 0; i < targetNodeData.__comps__.length; i++) {
                        const comp = targetNodeData.__comps__[i];
                        console.log(`[ComponentTools] Checking component ${i}: type=${comp.type}, target=${expectedComponentType}`);
                        if (comp.type === expectedComponentType) {
                            targetComponent = comp;
                            console.log(`[ComponentTools] Found matching component at index ${i}: ${comp.type}`);
                            // 从组件的value.uuid.value中获取组件在场景中的ID
                            if (comp.value && comp.value.uuid && comp.value.uuid.value) {
                                componentId = comp.value.uuid.value;
                                console.log(`[ComponentTools] Got componentId from comp.value.uuid.value: ${componentId}`);
                            }
                            else {
                                console.log(`[ComponentTools] Component structure:`, {
                                    hasValue: !!comp.value,
                                    hasUuid: !!(comp.value && comp.value.uuid),
                                    hasUuidValue: !!(comp.value && comp.value.uuid && comp.value.uuid.value),
                                    uuidStructure: comp.value ? comp.value.uuid : 'No value'
                                });
                                throw new Error(`Unable to extract component ID from component structure`);
                            }
                            break;
                        }
                    }
                    if (!targetComponent) {
                        // 如果没找到，列出可用组件让用户了解，显示场景中的真实ID
                        const availableComponents = targetNodeData.__comps__.map((comp, index) => {
                            let sceneId = 'unknown';
                            // 从组件的value.uuid.value获取场景ID
                            if (comp.value && comp.value.uuid && comp.value.uuid.value) {
                                sceneId = comp.value.uuid.value;
                            }
                            return `${comp.type}(scene_id:${sceneId})`;
                        });
                        throw new Error(`Component type '${expectedComponentType}' not found on node ${targetNodeUuid}. Available components: ${availableComponents.join(', ')}`);
                    }
                    console.log(`[ComponentTools] Found component ${expectedComponentType} with scene ID: ${componentId} on node ${targetNodeUuid}`);
                    // 更新期望值为实际的组件ID对象格式，用于后续验证
                    if (componentId) {
                        actualExpectedValue = { uuid: componentId };
                    }
                    // 尝试使用与节点/资源引用相同的格式：{uuid: componentId}
                    // 测试看是否能正确设置组件引用
                    await Editor.Message.request('scene', 'set-property', {
                        uuid: nodeUuid,
                        path: propertyPath,
                        dump: {
                            value: { uuid: componentId }, // 使用对象格式，像节点/资源引用一样
                            type: expectedComponentType
                        }
                    });
                }
                catch (error) {
                    console.error(`[ComponentTools] Error setting component reference:`, error);
                    throw error;
                }
            }
            else if (this.isSupportedArrayType(finalPropertyType) && Array.isArray(processedValue)) {
                const elementType = this.getArrayDumpElementType(finalPropertyType, propertyInfo.metadata);
                console.log(`[ComponentTools] Setting ${finalPropertyType} with element type ${elementType}:`, processedValue);
                await Editor.Message.request('scene', 'set-property', {
                    uuid: nodeUuid,
                    path: propertyPath,
                    dump: {
                        value: processedValue,
                        type: elementType,
                        isArray: true
                    }
                });
            }
            else {
                // Normal property setting for non-asset properties
                await Editor.Message.request('scene', 'set-property', {
                    uuid: nodeUuid,
                    path: propertyPath,
                    dump: { value: processedValue }
                });
            }
            // Step 5: 等待Editor完成更新，然后验证设置结果
            await new Promise(r => setTimeout(r, 200)); // 等待200ms让Editor完成更新
            const verification = await this.verifyPropertyChange(nodeUuid, componentType, property, originalValue, actualExpectedValue);
            return {
                success: true,
                message: `Successfully set ${componentType}.${property}`,
                data: {
                    nodeUuid,
                    componentType,
                    property,
                    propertyType: finalPropertyType,
                    typeAutoDetected: !propertyType || propertyType === 'auto',
                    actualValue: verification.actualValue,
                    changeVerified: verification.verified
                }
            };
        }
        catch (error) {
            console.error(`[ComponentTools] Error setting property:`, error);
            return {
                success: false,
                error: `Failed to set property: ${error.message}`
            };
        }
    }
    async getAvailableComponents(category = 'all') {
        const componentCategories = {
            renderer: ['cc.Sprite', 'cc.Label', 'cc.RichText', 'cc.Mask', 'cc.Graphics'],
            ui: ['cc.Button', 'cc.Toggle', 'cc.Slider', 'cc.ScrollView', 'cc.EditBox', 'cc.ProgressBar'],
            physics: ['cc.RigidBody2D', 'cc.BoxCollider2D', 'cc.CircleCollider2D', 'cc.PolygonCollider2D'],
            animation: ['cc.Animation', 'cc.AnimationClip', 'cc.SkeletalAnimation'],
            audio: ['cc.AudioSource'],
            layout: ['cc.Layout', 'cc.Widget', 'cc.PageView', 'cc.PageViewIndicator'],
            effects: ['cc.MotionStreak', 'cc.ParticleSystem2D'],
            camera: ['cc.Camera'],
            light: ['cc.Light', 'cc.DirectionalLight', 'cc.PointLight', 'cc.SpotLight']
        };
        let components = [];
        if (category === 'all') {
            for (const cat in componentCategories) {
                components = components.concat(componentCategories[cat]);
            }
        }
        else if (componentCategories[category]) {
            components = componentCategories[category];
        }
        return {
            success: true,
            data: {
                category: category,
                components: components
            }
        };
    }
    isValidPropertyDescriptor(propData) {
        // 检查是否是有效的属性描述对象
        if (typeof propData !== 'object' || propData === null) {
            return false;
        }
        try {
            const keys = Object.keys(propData);
            // 避免遍历简单的数值对象（如 {width: 200, height: 150}）
            const isSimpleValueObject = keys.every(key => {
                const value = propData[key];
                return typeof value === 'number' || typeof value === 'string' || typeof value === 'boolean';
            });
            if (isSimpleValueObject) {
                return false;
            }
            // 检查是否包含属性描述符的特征字段，不使用'in'操作符
            const hasName = keys.includes('name');
            const hasValue = keys.includes('value');
            const hasType = keys.includes('type');
            const hasDisplayName = keys.includes('displayName');
            const hasReadonly = keys.includes('readonly');
            // 必须包含name或value字段，且通常还有type字段
            const hasValidStructure = (hasName || hasValue) && (hasType || hasDisplayName || hasReadonly);
            // 额外检查：如果有default字段且结构复杂，避免深度遍历
            if (keys.includes('default') && propData.default && typeof propData.default === 'object') {
                const defaultKeys = Object.keys(propData.default);
                if (defaultKeys.includes('value') && typeof propData.default.value === 'object') {
                    // 这种情况下，我们只返回顶层属性，不深入遍历default.value
                    return hasValidStructure;
                }
            }
            return hasValidStructure;
        }
        catch (error) {
            console.warn(`[isValidPropertyDescriptor] Error checking property descriptor:`, error);
            return false;
        }
    }
    analyzeProperty(component, propertyName) {
        // 从复杂的组件结构中提取可用属性
        const availableProperties = [];
        let propertyValue = undefined;
        let propertyExists = false;
        let propertyMetadata = undefined;
        // 尝试多种方式查找属性：
        // 1. 直接属性访问
        if (Object.prototype.hasOwnProperty.call(component, propertyName)) {
            propertyValue = component[propertyName];
            propertyExists = true;
        }
        // 2. 从嵌套结构中查找 (如从测试数据看到的复杂结构)
        if (!propertyExists && component.properties && typeof component.properties === 'object') {
            // 首先检查properties.value是否存在（这是我们在getComponents中看到的结构）
            if (component.properties.value && typeof component.properties.value === 'object') {
                const valueObj = component.properties.value;
                for (const [key, propData] of Object.entries(valueObj)) {
                    // 检查propData是否是一个有效的属性描述对象
                    // 确保propData是对象且包含预期的属性结构
                    if (this.isValidPropertyDescriptor(propData)) {
                        const propInfo = propData;
                        availableProperties.push(key);
                        if (key === propertyName) {
                            propertyMetadata = propInfo;
                            // 优先使用value属性，如果没有则使用propData本身
                            try {
                                const propKeys = Object.keys(propInfo);
                                propertyValue = propKeys.includes('value') ? propInfo.value : propInfo;
                            }
                            catch (error) {
                                // 如果检查失败，直接使用propInfo
                                propertyValue = propInfo;
                            }
                            propertyExists = true;
                        }
                    }
                }
            }
            else {
                // 备用方案：直接从properties查找
                for (const [key, propData] of Object.entries(component.properties)) {
                    if (this.isValidPropertyDescriptor(propData)) {
                        const propInfo = propData;
                        availableProperties.push(key);
                        if (key === propertyName) {
                            propertyMetadata = propInfo;
                            // 优先使用value属性，如果没有则使用propData本身
                            try {
                                const propKeys = Object.keys(propInfo);
                                propertyValue = propKeys.includes('value') ? propInfo.value : propInfo;
                            }
                            catch (error) {
                                // 如果检查失败，直接使用propInfo
                                propertyValue = propInfo;
                            }
                            propertyExists = true;
                        }
                    }
                }
            }
        }
        // 3. 从直接属性中提取简单属性名
        if (availableProperties.length === 0) {
            for (const key of Object.keys(component)) {
                if (!key.startsWith('_') && !['__type__', 'cid', 'node', 'uuid', 'name', 'enabled', 'type', 'readonly', 'visible'].includes(key)) {
                    availableProperties.push(key);
                }
            }
        }
        if (!propertyExists) {
            return {
                exists: false,
                type: 'unknown',
                availableProperties,
                originalValue: undefined
            };
        }
        let type = 'unknown';
        // 智能类型检测
        if (Array.isArray(propertyValue)) {
            type = this.detectArrayPropertyType(propertyName, propertyValue, propertyMetadata);
        }
        else if (typeof propertyValue === 'string') {
            // Check if property name suggests it's an asset
            if (['spriteFrame', 'texture', 'material', 'font', 'clip', 'prefab'].includes(propertyName.toLowerCase())) {
                type = 'asset';
            }
            else {
                type = 'string';
            }
        }
        else if (typeof propertyValue === 'number') {
            type = 'number';
        }
        else if (typeof propertyValue === 'boolean') {
            type = 'boolean';
        }
        else if (propertyValue && typeof propertyValue === 'object') {
            try {
                const keys = Object.keys(propertyValue);
                if (keys.includes('r') && keys.includes('g') && keys.includes('b')) {
                    type = 'color';
                }
                else if (keys.includes('x') && keys.includes('y')) {
                    type = propertyValue.z !== undefined ? 'vec3' : 'vec2';
                }
                else if (keys.includes('width') && keys.includes('height')) {
                    type = 'size';
                }
                else if (keys.includes('uuid') || keys.includes('__uuid__')) {
                    // 检查是否是节点引用（通过属性名或__id__属性判断）
                    if (propertyName.toLowerCase().includes('node') ||
                        propertyName.toLowerCase().includes('target') ||
                        keys.includes('__id__')) {
                        type = 'node';
                    }
                    else {
                        type = 'asset';
                    }
                }
                else if (keys.includes('__id__')) {
                    // 节点引用特征
                    type = 'node';
                }
                else {
                    type = 'object';
                }
            }
            catch (error) {
                console.warn(`[analyzeProperty] Error checking property type for: ${JSON.stringify(propertyValue)}`);
                type = 'object';
            }
        }
        else if (propertyValue === null || propertyValue === undefined) {
            // For null/undefined values, check property name to determine type
            if (['spriteFrame', 'texture', 'material', 'font', 'clip', 'prefab'].includes(propertyName.toLowerCase())) {
                type = 'asset';
            }
            else if (propertyName.toLowerCase().includes('node') ||
                propertyName.toLowerCase().includes('target')) {
                type = 'node';
            }
            else if (propertyName.toLowerCase().includes('component')) {
                type = 'component';
            }
            else {
                type = 'unknown';
            }
        }
        return {
            exists: true,
            type,
            availableProperties,
            originalValue: propertyValue,
            metadata: propertyMetadata
        };
    }
    getArrayElementCocosType(metadata) {
        if (!metadata || typeof metadata !== 'object')
            return undefined;
        const candidates = [metadata.type, metadata.ctor, metadata.elementType, metadata.itemType];
        for (const candidate of candidates) {
            if (typeof candidate === 'string' && candidate.length > 0 && candidate !== 'Array')
                return candidate;
            if (candidate && typeof candidate === 'object') {
                const nested = candidate.type || candidate.name || candidate.ctor;
                if (typeof nested === 'string' && nested.length > 0)
                    return nested;
            }
        }
        return undefined;
    }
    detectArrayPropertyType(propertyName, value, metadata) {
        const cocosType = (this.getArrayElementCocosType(metadata) || '').toLowerCase();
        if (cocosType === 'cc.node' || cocosType.endsWith('.node'))
            return 'nodeArray';
        if (cocosType === 'cc.color' || cocosType.endsWith('.color'))
            return 'colorArray';
        if (cocosType === 'number' || cocosType === 'cc.number' || cocosType === 'float' || cocosType === 'integer')
            return 'numberArray';
        if (cocosType === 'boolean' || cocosType === 'cc.boolean')
            return 'booleanArray';
        if (cocosType === 'string' || cocosType === 'cc.string')
            return 'stringArray';
        if (cocosType && (cocosType.startsWith('cc.') || cocosType.includes('asset')))
            return 'assetArray';
        const sample = value.find(item => item !== null && item !== undefined);
        if (typeof sample === 'number')
            return 'numberArray';
        if (typeof sample === 'boolean')
            return 'booleanArray';
        if (sample && typeof sample === 'object') {
            if ('r' in sample && 'g' in sample && 'b' in sample)
                return 'colorArray';
            if ('uuid' in sample || '__uuid__' in sample) {
                const name = propertyName.toLowerCase();
                return name.includes('node') || name.includes('target') ? 'nodeArray' : 'assetArray';
            }
        }
        const name = propertyName.toLowerCase();
        if (name.includes('node') || name.includes('target'))
            return 'nodeArray';
        if (name.includes('color'))
            return 'colorArray';
        return 'stringArray';
    }
    isSupportedArrayType(type) {
        return ['nodeArray', 'assetArray', 'colorArray', 'numberArray', 'booleanArray', 'stringArray'].includes(type);
    }
    getArrayDumpElementType(type, metadata) {
        const metadataType = this.getArrayElementCocosType(metadata);
        if (metadataType)
            return metadataType;
        const typeMap = {
            nodeArray: 'cc.Node',
            assetArray: 'cc.Asset',
            colorArray: 'cc.Color',
            numberArray: 'Number',
            booleanArray: 'Boolean',
            stringArray: 'String'
        };
        return typeMap[type] || 'String';
    }
    /**
     * 自动检测属性类型
     */
    autoDetectPropertyType(propertyName, value, originalValue, detectedType, metadata) {
        // 数组必须优先检测；否则 nodes/targets 等名称会被误判成单个节点引用。
        if (Array.isArray(value)) {
            const originalArray = Array.isArray(originalValue) ? originalValue : [];
            return this.detectArrayPropertyType(propertyName, value.length > 0 ? value : originalArray, metadata);
        }
        // 1. 基于属性名称的启发式检测
        const nameLower = propertyName.toLowerCase();
        // 资源类型检测
        if (nameLower.includes('prefab'))
            return 'prefab';
        if (nameLower.includes('spriteframe') || nameLower.includes('sprite_frame'))
            return 'spriteFrame';
        if (nameLower.includes('material'))
            return 'asset';
        if (nameLower.includes('texture') || nameLower.includes('font') || nameLower.includes('clip'))
            return 'asset';
        // 节点引用检测
        if (nameLower.includes('node') || nameLower.includes('target') || nameLower.includes('player') ||
            nameLower.includes('enemy') || nameLower.includes('bullet') || nameLower.includes('ui') ||
            nameLower.includes('layer') || nameLower.includes('canvas'))
            return 'node';
        // 组件引用检测
        if (nameLower.includes('component'))
            return 'component';
        // 2. 基于值类型的检测
        if (typeof value === 'string') {
            // UUID格式检测
            if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) {
                // 长UUID通常是资源引用
                return 'asset';
            }
            // 十六进制颜色检测
            if (/^#[0-9a-f]{6}$/i.test(value)) {
                return 'color';
            }
            return 'string';
        }
        if (typeof value === 'number')
            return 'number';
        if (typeof value === 'boolean')
            return 'boolean';
        // 对象类型检测
        if (typeof value === 'object' && value !== null) {
            // 颜色对象检测
            if ('r' in value && 'g' in value && 'b' in value)
                return 'color';
            // Vec2检测
            if ('x' in value && 'y' in value && !('z' in value))
                return 'vec2';
            // Vec3检测
            if ('x' in value && 'y' in value && 'z' in value)
                return 'vec3';
            // Size检测
            if ('width' in value && 'height' in value)
                return 'size';
            // UUID对象检测（资源引用）
            if ('uuid' in value)
                return 'asset';
        }
        // 3. 基于原始值的回退检测
        if (originalValue !== undefined && originalValue !== null) {
            if (typeof originalValue === 'object' && 'r' in originalValue)
                return 'color';
            if (typeof originalValue === 'object' && 'x' in originalValue && 'y' in originalValue) {
                return 'z' in originalValue ? 'vec3' : 'vec2';
            }
            if (typeof originalValue === 'object' && 'width' in originalValue)
                return 'size';
        }
        // 4. 使用检测到的类型作为回退
        if (detectedType && detectedType !== 'unknown')
            return detectedType;
        // 5. 最终回退到基本类型
        return 'string';
    }
    smartConvertValue(inputValue, propertyInfo) {
        const { type, originalValue } = propertyInfo;
        console.log(`[smartConvertValue] Converting ${JSON.stringify(inputValue)} to type: ${type}`);
        switch (type) {
            case 'string':
                return String(inputValue);
            case 'number':
                return Number(inputValue);
            case 'boolean':
                if (typeof inputValue === 'boolean')
                    return inputValue;
                if (typeof inputValue === 'string') {
                    return inputValue.toLowerCase() === 'true' || inputValue === '1';
                }
                return Boolean(inputValue);
            case 'color':
                // 优化的颜色处理，支持多种输入格式
                if (typeof inputValue === 'string') {
                    // 字符串格式：十六进制、颜色名称、rgb()/rgba()
                    return this.parseColorString(inputValue);
                }
                else if (typeof inputValue === 'object' && inputValue !== null) {
                    try {
                        const inputKeys = Object.keys(inputValue);
                        // 如果输入是颜色对象，验证并转换
                        if (inputKeys.includes('r') || inputKeys.includes('g') || inputKeys.includes('b')) {
                            return {
                                r: Math.min(255, Math.max(0, Number(inputValue.r) || 0)),
                                g: Math.min(255, Math.max(0, Number(inputValue.g) || 0)),
                                b: Math.min(255, Math.max(0, Number(inputValue.b) || 0)),
                                a: inputValue.a !== undefined ? Math.min(255, Math.max(0, Number(inputValue.a))) : 255
                            };
                        }
                    }
                    catch (error) {
                        console.warn(`[smartConvertValue] Invalid color object: ${JSON.stringify(inputValue)}`);
                    }
                }
                // 如果有原值，保持原值结构并更新提供的值
                if (originalValue && typeof originalValue === 'object') {
                    try {
                        const inputKeys = typeof inputValue === 'object' && inputValue ? Object.keys(inputValue) : [];
                        return {
                            r: inputKeys.includes('r') ? Math.min(255, Math.max(0, Number(inputValue.r))) : (originalValue.r || 255),
                            g: inputKeys.includes('g') ? Math.min(255, Math.max(0, Number(inputValue.g))) : (originalValue.g || 255),
                            b: inputKeys.includes('b') ? Math.min(255, Math.max(0, Number(inputValue.b))) : (originalValue.b || 255),
                            a: inputKeys.includes('a') ? Math.min(255, Math.max(0, Number(inputValue.a))) : (originalValue.a || 255)
                        };
                    }
                    catch (error) {
                        console.warn(`[smartConvertValue] Error processing color with original value: ${error}`);
                    }
                }
                // 默认返回白色
                console.warn(`[smartConvertValue] Using default white color for invalid input: ${JSON.stringify(inputValue)}`);
                return { r: 255, g: 255, b: 255, a: 255 };
            case 'vec2':
                if (typeof inputValue === 'object' && inputValue !== null) {
                    return {
                        x: Number(inputValue.x) || originalValue.x || 0,
                        y: Number(inputValue.y) || originalValue.y || 0
                    };
                }
                return originalValue;
            case 'vec3':
                if (typeof inputValue === 'object' && inputValue !== null) {
                    return {
                        x: Number(inputValue.x) || originalValue.x || 0,
                        y: Number(inputValue.y) || originalValue.y || 0,
                        z: Number(inputValue.z) || originalValue.z || 0
                    };
                }
                return originalValue;
            case 'size':
                if (typeof inputValue === 'object' && inputValue !== null) {
                    return {
                        width: Number(inputValue.width) || originalValue.width || 100,
                        height: Number(inputValue.height) || originalValue.height || 100
                    };
                }
                return originalValue;
            case 'node':
                if (typeof inputValue === 'string') {
                    // 节点引用需要特殊处理
                    return inputValue;
                }
                else if (typeof inputValue === 'object' && inputValue !== null) {
                    // 如果已经是对象形式，返回UUID或完整对象
                    return inputValue.uuid || inputValue;
                }
                return originalValue;
            case 'asset':
                if (typeof inputValue === 'string') {
                    // 如果输入是字符串路径，转换为asset对象
                    return { uuid: inputValue };
                }
                else if (typeof inputValue === 'object' && inputValue !== null) {
                    return inputValue;
                }
                return originalValue;
            default:
                // 对于未知类型，尽量保持原有结构
                if (typeof inputValue === typeof originalValue) {
                    return inputValue;
                }
                return originalValue;
        }
    }
    parseColorString(colorStr) {
        const str = colorStr.trim();
        // 只支持十六进制格式 #RRGGBB 或 #RRGGBBAA
        if (str.startsWith('#')) {
            if (str.length === 7) { // #RRGGBB
                const r = parseInt(str.substring(1, 3), 16);
                const g = parseInt(str.substring(3, 5), 16);
                const b = parseInt(str.substring(5, 7), 16);
                return { r, g, b, a: 255 };
            }
            else if (str.length === 9) { // #RRGGBBAA
                const r = parseInt(str.substring(1, 3), 16);
                const g = parseInt(str.substring(3, 5), 16);
                const b = parseInt(str.substring(5, 7), 16);
                const a = parseInt(str.substring(7, 9), 16);
                return { r, g, b, a };
            }
        }
        // 如果不是有效的十六进制格式，返回错误提示
        throw new Error(`Invalid color format: "${colorStr}". Only hexadecimal format is supported (e.g., "#FF0000" or "#FF0000FF")`);
    }
    async verifyPropertyChange(nodeUuid, componentType, property, originalValue, expectedValue) {
        var _a, _b;
        console.log(`[verifyPropertyChange] Starting verification for ${componentType}.${property}`);
        console.log(`[verifyPropertyChange] Expected value:`, JSON.stringify(expectedValue));
        console.log(`[verifyPropertyChange] Original value:`, JSON.stringify(originalValue));
        try {
            // 重新获取组件信息进行验证
            console.log(`[verifyPropertyChange] Calling getComponentInfo...`);
            const componentInfo = await this.getComponentInfo(nodeUuid, componentType);
            console.log(`[verifyPropertyChange] getComponentInfo success:`, componentInfo.success);
            const allComponents = await this.getComponents(nodeUuid);
            console.log(`[verifyPropertyChange] getComponents success:`, allComponents.success);
            if (componentInfo.success && componentInfo.data) {
                console.log(`[verifyPropertyChange] Component data available, extracting property '${property}'`);
                const allPropertyNames = Object.keys(componentInfo.data.properties || {});
                console.log(`[verifyPropertyChange] Available properties:`, allPropertyNames);
                const propertyData = (_a = componentInfo.data.properties) === null || _a === void 0 ? void 0 : _a[property];
                console.log(`[verifyPropertyChange] Raw property data for '${property}':`, JSON.stringify(propertyData));
                // 从属性数据中提取实际值
                let actualValue = propertyData;
                console.log(`[verifyPropertyChange] Initial actualValue:`, JSON.stringify(actualValue));
                if (propertyData && typeof propertyData === 'object' && 'value' in propertyData) {
                    actualValue = propertyData.value;
                    console.log(`[verifyPropertyChange] Extracted actualValue from .value:`, JSON.stringify(actualValue));
                }
                else {
                    console.log(`[verifyPropertyChange] No .value property found, using raw data`);
                }
                // 修复验证逻辑：检查实际值是否匹配期望值
                let verified = false;
                if (typeof expectedValue === 'object' && expectedValue !== null && 'uuid' in expectedValue) {
                    // 对于引用类型（节点/组件/资源），比较UUID
                    const actualUuid = actualValue && typeof actualValue === 'object' && 'uuid' in actualValue ? actualValue.uuid : '';
                    const expectedUuid = expectedValue.uuid || '';
                    verified = actualUuid === expectedUuid && expectedUuid !== '';
                    console.log(`[verifyPropertyChange] Reference comparison:`);
                    console.log(`  - Expected UUID: "${expectedUuid}"`);
                    console.log(`  - Actual UUID: "${actualUuid}"`);
                    console.log(`  - UUID match: ${actualUuid === expectedUuid}`);
                    console.log(`  - UUID not empty: ${expectedUuid !== ''}`);
                    console.log(`  - Final verified: ${verified}`);
                }
                else {
                    // 对于其他类型，直接比较值
                    console.log(`[verifyPropertyChange] Value comparison:`);
                    console.log(`  - Expected type: ${typeof expectedValue}`);
                    console.log(`  - Actual type: ${typeof actualValue}`);
                    if (typeof actualValue === typeof expectedValue) {
                        if (typeof actualValue === 'object' && actualValue !== null && expectedValue !== null) {
                            // 对象类型的深度比较
                            verified = JSON.stringify(actualValue) === JSON.stringify(expectedValue);
                            console.log(`  - Object comparison (JSON): ${verified}`);
                        }
                        else {
                            // 基本类型的直接比较
                            verified = actualValue === expectedValue;
                            console.log(`  - Direct comparison: ${verified}`);
                        }
                    }
                    else {
                        // 类型不匹配时的特殊处理（如数字和字符串）
                        const stringMatch = String(actualValue) === String(expectedValue);
                        const numberMatch = Number(actualValue) === Number(expectedValue);
                        verified = stringMatch || numberMatch;
                        console.log(`  - String match: ${stringMatch}`);
                        console.log(`  - Number match: ${numberMatch}`);
                        console.log(`  - Type mismatch verified: ${verified}`);
                    }
                }
                console.log(`[verifyPropertyChange] Final verification result: ${verified}`);
                console.log(`[verifyPropertyChange] Final actualValue:`, JSON.stringify(actualValue));
                const result = {
                    verified,
                    actualValue,
                    fullData: {
                        // 只返回修改的属性信息，不返回完整组件数据
                        modifiedProperty: {
                            name: property,
                            before: originalValue,
                            expected: expectedValue,
                            actual: actualValue,
                            verified,
                            propertyMetadata: propertyData // 只包含这个属性的元数据
                        },
                        // 简化的组件信息
                        componentSummary: {
                            nodeUuid,
                            componentType,
                            totalProperties: Object.keys(((_b = componentInfo.data) === null || _b === void 0 ? void 0 : _b.properties) || {}).length
                        }
                    }
                };
                console.log(`[verifyPropertyChange] Returning result:`, JSON.stringify(result, null, 2));
                return result;
            }
            else {
                console.log(`[verifyPropertyChange] ComponentInfo failed or no data:`, componentInfo);
            }
        }
        catch (error) {
            console.error('[verifyPropertyChange] Verification failed with error:', error);
            console.error('[verifyPropertyChange] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
        }
        console.log(`[verifyPropertyChange] Returning fallback result`);
        return {
            verified: false,
            actualValue: undefined,
            fullData: null
        };
    }
    /**
     * 检测是否为节点属性，如果是则重定向到对应的节点方法
     */
    async checkAndRedirectNodeProperties(args) {
        const { nodeUuid, componentType, property, propertyType, value } = args;
        // 检测是否为节点基础属性（应该使用 set_node_property）
        const nodeBasicProperties = [
            'name', 'active', 'layer', 'mobility', 'parent', 'children', 'hideFlags'
        ];
        // 检测是否为节点变换属性（应该使用 set_node_transform）
        const nodeTransformProperties = [
            'position', 'rotation', 'scale', 'eulerAngles', 'angle'
        ];
        // Detect attempts to set cc.Node properties (common mistake)
        if (componentType === 'cc.Node' || componentType === 'Node') {
            if (nodeBasicProperties.includes(property)) {
                return {
                    success: false,
                    error: `Property '${property}' is a node basic property, not a component property`,
                    instruction: `Please use set_node_property method to set node properties: set_node_property(uuid="${nodeUuid}", property="${property}", value=${JSON.stringify(value)})`
                };
            }
            else if (nodeTransformProperties.includes(property)) {
                return {
                    success: false,
                    error: `Property '${property}' is a node transform property, not a component property`,
                    instruction: `Please use set_node_transform method to set transform properties: set_node_transform(uuid="${nodeUuid}", ${property}=${JSON.stringify(value)})`
                };
            }
        }
        // Detect common incorrect usage
        if (nodeBasicProperties.includes(property) || nodeTransformProperties.includes(property)) {
            const methodName = nodeTransformProperties.includes(property) ? 'set_node_transform' : 'set_node_property';
            return {
                success: false,
                error: `Property '${property}' is a node property, not a component property`,
                instruction: `Property '${property}' should be set using ${methodName} method, not set_component_property. Please use: ${methodName}(uuid="${nodeUuid}", ${nodeTransformProperties.includes(property) ? property : `property="${property}"`}=${JSON.stringify(value)})`
            };
        }
        return null; // 不是节点属性，继续正常处理
    }
    /**
     * 生成组件建议信息
     */
    generateComponentSuggestion(requestedType, availableTypes, property) {
        // 检查是否存在相似的组件类型
        const similarTypes = availableTypes.filter(type => type.toLowerCase().includes(requestedType.toLowerCase()) ||
            requestedType.toLowerCase().includes(type.toLowerCase()));
        let instruction = '';
        if (similarTypes.length > 0) {
            instruction += `\n\n🔍 Found similar components: ${similarTypes.join(', ')}`;
            instruction += `\n💡 Suggestion: Perhaps you meant to set the '${similarTypes[0]}' component?`;
        }
        // Recommend possible components based on property name
        const propertyToComponentMap = {
            'string': ['cc.Label', 'cc.RichText', 'cc.EditBox'],
            'text': ['cc.Label', 'cc.RichText'],
            'fontSize': ['cc.Label', 'cc.RichText'],
            'spriteFrame': ['cc.Sprite'],
            'color': ['cc.Label', 'cc.Sprite', 'cc.Graphics'],
            'normalColor': ['cc.Button'],
            'pressedColor': ['cc.Button'],
            'target': ['cc.Button'],
            'contentSize': ['cc.UITransform'],
            'anchorPoint': ['cc.UITransform']
        };
        const recommendedComponents = propertyToComponentMap[property] || [];
        const availableRecommended = recommendedComponents.filter(comp => availableTypes.includes(comp));
        if (availableRecommended.length > 0) {
            instruction += `\n\n🎯 Based on property '${property}', recommended components: ${availableRecommended.join(', ')}`;
        }
        // Provide operation suggestions
        instruction += `\n\n📋 Suggested Actions:`;
        instruction += `\n1. Use get_components(nodeUuid="${requestedType.includes('uuid') ? 'YOUR_NODE_UUID' : 'nodeUuid'}") to view all components on the node`;
        instruction += `\n2. If you need to add a component, use add_component(nodeUuid="...", componentType="${requestedType}")`;
        instruction += `\n3. Verify that the component type name is correct (case-sensitive)`;
        return instruction;
    }
    /**
     * 快速验证资源设置结果
     */
    async quickVerifyAsset(nodeUuid, componentType, property) {
        try {
            const rawNodeData = await Editor.Message.request('scene', 'query-node', nodeUuid);
            if (!rawNodeData || !rawNodeData.__comps__) {
                return null;
            }
            // 找到组件
            const component = rawNodeData.__comps__.find((comp) => {
                const compType = comp.__type__ || comp.cid || comp.type;
                return compType === componentType;
            });
            if (!component) {
                return null;
            }
            // 提取属性值
            const properties = this.extractComponentProperties(component);
            const propertyData = properties[property];
            if (propertyData && typeof propertyData === 'object' && 'value' in propertyData) {
                return propertyData.value;
            }
            else {
                return propertyData;
            }
        }
        catch (error) {
            console.error(`[quickVerifyAsset] Error:`, error);
            return null;
        }
    }
    /**
     * 配置按钮点击事件 - 统一接口支持添加、移除和清空操作
     */
    async configureClickEvent(args) {
        var _a, _b, _c, _d;
        try {
            const { nodeUuid, operation = 'add', targetNodeUuid, componentName, handlerName, customEventData, eventIndex } = args;
            // 重新获取最新的组件状态，确保数据同步
            const refreshedComponents = await this.getComponents(nodeUuid);
            if (!refreshedComponents.success || !((_a = refreshedComponents.data) === null || _a === void 0 ? void 0 : _a.components)) {
                return { success: false, error: 'Button node not found or has no components' };
            }
            const buttonComponent = refreshedComponents.data.components.find((comp) => comp.type === 'cc.Button');
            if (!buttonComponent) {
                return { success: false, error: 'Node does not have a Button component' };
            }
            // 获取当前的clickEvents数组，确保使用最新数据
            let currentClickEvents = [];
            if (buttonComponent.properties.clickEvents && buttonComponent.properties.clickEvents.value) {
                currentClickEvents = Array.isArray(buttonComponent.properties.clickEvents.value)
                    ? buttonComponent.properties.clickEvents.value
                    : [];
            }
            console.log(`Current clickEvents count: ${currentClickEvents.length}, operation: ${operation}`);
            const previousEventCount = currentClickEvents.length;
            let updatedClickEvents = [];
            let message = '';
            switch (operation) {
                case 'modify':
                    // 修改现有事件
                    if (eventIndex === undefined || eventIndex < 0 || eventIndex >= currentClickEvents.length) {
                        return {
                            success: false,
                            error: `Invalid event index ${eventIndex}. Available indices: 0-${currentClickEvents.length - 1}`
                        };
                    }
                    // 根据编辑器的行为优化：深拷贝事件数据以避免直接修改引用
                    updatedClickEvents = [...currentClickEvents];
                    // 深拷贝要修改的事件，避免修改原始数据
                    const existingEvent = JSON.parse(JSON.stringify(currentClickEvents[eventIndex]));
                    // 如果要修改目标节点或组件，需要完整验证
                    if (targetNodeUuid !== undefined || componentName !== undefined) {
                        // 确定要验证的节点和组件
                        const nodeToVerify = targetNodeUuid || existingEvent.value.target.value.uuid;
                        const compToVerify = componentName || existingEvent.value._componentId.value;
                        // 1. 首先验证节点是否存在
                        if (targetNodeUuid !== undefined) {
                            const verifyNodeComponents = await this.getComponents(targetNodeUuid);
                            if (!verifyNodeComponents.success || !((_b = verifyNodeComponents.data) === null || _b === void 0 ? void 0 : _b.components)) {
                                return {
                                    success: false,
                                    error: `Target node '${targetNodeUuid}' not found or has no components`
                                };
                            }
                            // 2. 如果同时要修改组件，验证组件是否存在
                            if (componentName !== undefined) {
                                const verifyTargetComponent = verifyNodeComponents.data.components.find((comp) => comp.type === componentName ||
                                    (comp.properties && comp.properties._name && comp.properties._name.value === componentName));
                                if (!verifyTargetComponent) {
                                    return {
                                        success: false,
                                        error: `Component '${componentName}' not found on target node. Available components: ${verifyNodeComponents.data.components.map((c) => c.type).join(', ')}`
                                    };
                                }
                            }
                        }
                        // 3. 验证 handler 方法是否存在
                        if (handlerName !== undefined && nodeToVerify && compToVerify) {
                            try {
                                console.log(`Verifying handler '${handlerName}' on node ${nodeToVerify}, component ${compToVerify}`);
                                const componentFunctions = await Editor.Message.request('scene', 'query-component-function-of-node', nodeToVerify);
                                console.log('Component functions for modify:', componentFunctions);
                                let handlerFound = false;
                                if (componentFunctions && Array.isArray(componentFunctions)) {
                                    for (const compFuncs of componentFunctions) {
                                        if (compFuncs.component === compToVerify || compFuncs.name === compToVerify) {
                                            if (compFuncs.functions && Array.isArray(compFuncs.functions)) {
                                                handlerFound = compFuncs.functions.some((func) => func === handlerName ||
                                                    (typeof func === 'object' && func.name === handlerName));
                                                if (handlerFound)
                                                    break;
                                            }
                                        }
                                    }
                                }
                                else if (componentFunctions && typeof componentFunctions === 'object' && componentFunctions[compToVerify]) {
                                    const funcs = componentFunctions[compToVerify];
                                    if (Array.isArray(funcs)) {
                                        handlerFound = funcs.includes(handlerName);
                                    }
                                    else if (funcs.functions && Array.isArray(funcs.functions)) {
                                        handlerFound = funcs.functions.includes(handlerName);
                                    }
                                }
                                if (!handlerFound) {
                                    console.warn(`Handler '${handlerName}' not found in component '${compToVerify}' on node ${nodeToVerify}. This might be a custom method.`);
                                    // 不阻止操作，因为可能是自定义方法
                                }
                            }
                            catch (err) {
                                console.error('Failed to verify handler for modify operation:', err);
                                // 查询失败不应该阻止操作
                            }
                        }
                    }
                    // 更新指定的属性
                    if (targetNodeUuid !== undefined) {
                        existingEvent.value.target.value.uuid = targetNodeUuid;
                    }
                    if (componentName !== undefined) {
                        existingEvent.value._componentId.value = componentName;
                    }
                    if (handlerName !== undefined) {
                        existingEvent.value.handler.value = handlerName;
                    }
                    if (customEventData !== undefined) {
                        existingEvent.value.customEventData.value = customEventData;
                    }
                    // 将修改后的事件放回数组
                    updatedClickEvents[eventIndex] = existingEvent;
                    message = `Click event at index ${eventIndex} modified successfully`;
                    break;
                case 'add':
                    // 验证目标节点和组件是否存在
                    const targetComponents = await this.getComponents(targetNodeUuid);
                    if (!targetComponents.success || !((_c = targetComponents.data) === null || _c === void 0 ? void 0 : _c.components)) {
                        return { success: false, error: 'Target node not found or has no components' };
                    }
                    const targetComponent = targetComponents.data.components.find((comp) => comp.type === componentName ||
                        (comp.properties && comp.properties._name && comp.properties._name.value === componentName));
                    if (!targetComponent) {
                        return {
                            success: false,
                            error: `Component '${componentName}' not found on target node. Available components: ${targetComponents.data.components.map((c) => c.type).join(', ')}`
                        };
                    }
                    // 验证 handler 方法是否存在于目标组件中
                    if (handlerName) {
                        try {
                            console.log(`Querying component functions for node: ${targetNodeUuid}`);
                            const componentFunctions = await Editor.Message.request('scene', 'query-component-function-of-node', targetNodeUuid);
                            console.log('Component functions result:', componentFunctions);
                            // 检查返回的函数列表中是否包含指定的 handler
                            let handlerFound = false;
                            if (componentFunctions && Array.isArray(componentFunctions)) {
                                // 遍历所有组件的函数
                                for (const compFuncs of componentFunctions) {
                                    if (compFuncs.component === componentName || compFuncs.name === componentName) {
                                        // 检查该组件的函数列表
                                        if (compFuncs.functions && Array.isArray(compFuncs.functions)) {
                                            handlerFound = compFuncs.functions.some((func) => func === handlerName ||
                                                (typeof func === 'object' && func.name === handlerName));
                                            if (handlerFound)
                                                break;
                                        }
                                    }
                                }
                            }
                            else if (componentFunctions && typeof componentFunctions === 'object') {
                                // 可能返回的是对象格式
                                if (componentFunctions[componentName]) {
                                    const funcs = componentFunctions[componentName];
                                    if (Array.isArray(funcs)) {
                                        handlerFound = funcs.includes(handlerName);
                                    }
                                    else if (funcs.functions && Array.isArray(funcs.functions)) {
                                        handlerFound = funcs.functions.includes(handlerName);
                                    }
                                }
                            }
                            if (!handlerFound) {
                                console.warn(`Handler '${handlerName}' not found in component '${componentName}' functions. This might be a custom method or the query failed.`);
                                // 不要直接失败，因为可能是自定义方法或查询失败
                                // 只是记录警告，让操作继续
                            }
                        }
                        catch (err) {
                            console.error('Failed to query component functions:', err);
                            // 查询失败不应该阻止操作，只记录错误
                        }
                    }
                    // 构建符合Cocos Creator编辑器格式的点击事件配置
                    // 基于实际事件结构分析，使用完整的嵌套格式
                    const clickEventData = {
                        value: {
                            target: {
                                name: "target",
                                value: { uuid: targetNodeUuid },
                                default: null,
                                type: "cc.Node",
                                readonly: false,
                                visible: true,
                                animatable: true,
                                tooltip: "i18n:ENGINE.button.click_event.target",
                                displayName: "i18n:ENGINE.classes.cc.ClickEvent.properties.target.displayName",
                                extends: ["cc.Object"]
                            },
                            component: {
                                name: "component",
                                value: "",
                                default: "",
                                type: "String",
                                readonly: false,
                                visible: true,
                                animatable: true,
                                tooltip: "i18n:ENGINE.button.click_event.component",
                                displayName: "i18n:ENGINE.classes.cc.ClickEvent.properties.component.displayName",
                                extends: []
                            },
                            _componentId: {
                                name: "_componentId",
                                value: componentName,
                                default: "",
                                type: "String",
                                readonly: false,
                                visible: false,
                                animatable: true,
                                displayName: "i18n:ENGINE.classes.cc.ClickEvent.properties._componentId.displayName",
                                tooltip: "i18n:ENGINE.classes.cc.ClickEvent.properties._componentId.tooltip",
                                extends: []
                            },
                            handler: {
                                name: "handler",
                                value: handlerName,
                                default: "",
                                type: "String",
                                readonly: false,
                                visible: true,
                                animatable: true,
                                tooltip: "i18n:ENGINE.button.click_event.handler",
                                displayName: "i18n:ENGINE.classes.cc.ClickEvent.properties.handler.displayName",
                                extends: []
                            },
                            customEventData: {
                                name: "customEventData",
                                value: customEventData || "",
                                default: "",
                                type: "String",
                                readonly: false,
                                visible: true,
                                animatable: true,
                                tooltip: "i18n:ENGINE.button.click_event.customEventData",
                                displayName: "i18n:ENGINE.classes.cc.ClickEvent.properties.customEventData.displayName",
                                extends: []
                            }
                        },
                        default: {
                            type: "cc.ClickEvent",
                            value: {
                                target: {
                                    name: "target",
                                    value: { uuid: "" },
                                    default: null,
                                    type: "cc.Node",
                                    readonly: false,
                                    visible: true,
                                    animatable: true,
                                    tooltip: "i18n:ENGINE.button.click_event.target",
                                    displayName: "i18n:ENGINE.classes.cc.ClickEvent.properties.target.displayName",
                                    extends: ["cc.Object"]
                                },
                                component: {
                                    name: "component",
                                    value: "",
                                    default: "",
                                    type: "String",
                                    readonly: false,
                                    visible: true,
                                    animatable: true,
                                    tooltip: "i18n:ENGINE.button.click_event.component",
                                    displayName: "i18n:ENGINE.classes.cc.ClickEvent.properties.component.displayName",
                                    extends: []
                                },
                                _componentId: {
                                    name: "_componentId",
                                    value: "",
                                    default: "",
                                    type: "String",
                                    readonly: false,
                                    visible: false,
                                    animatable: true,
                                    displayName: "i18n:ENGINE.classes.cc.ClickEvent.properties._componentId.displayName",
                                    tooltip: "i18n:ENGINE.classes.cc.ClickEvent.properties._componentId.tooltip",
                                    extends: []
                                },
                                handler: {
                                    name: "handler",
                                    value: "",
                                    default: "",
                                    type: "String",
                                    readonly: false,
                                    visible: true,
                                    animatable: true,
                                    tooltip: "i18n:ENGINE.button.click_event.handler",
                                    displayName: "i18n:ENGINE.classes.cc.ClickEvent.properties.handler.displayName",
                                    extends: []
                                },
                                customEventData: {
                                    name: "customEventData",
                                    value: "",
                                    default: "",
                                    type: "String",
                                    readonly: false,
                                    visible: true,
                                    animatable: true,
                                    tooltip: "i18n:ENGINE.button.click_event.customEventData",
                                    displayName: "i18n:ENGINE.classes.cc.ClickEvent.properties.customEventData.displayName",
                                    extends: []
                                }
                            }
                        },
                        type: "cc.ClickEvent",
                        readonly: false,
                        visible: true,
                        animatable: true,
                        tooltip: "i18n:ENGINE.button.click_events",
                        displayOrder: 20,
                        extends: []
                    };
                    updatedClickEvents = [...currentClickEvents, clickEventData];
                    message = `Click event added successfully: ${targetNodeUuid}.${componentName}.${handlerName}()`;
                    break;
                case 'remove':
                    if (eventIndex === undefined || eventIndex < 0 || eventIndex >= currentClickEvents.length) {
                        return {
                            success: false,
                            error: `Invalid event index ${eventIndex}. Available indices: 0-${currentClickEvents.length - 1}`
                        };
                    }
                    updatedClickEvents = currentClickEvents.filter((_, index) => index !== eventIndex);
                    message = `Click event at index ${eventIndex} removed successfully`;
                    break;
                case 'clear':
                    updatedClickEvents = [];
                    message = `All click events cleared successfully (removed ${currentClickEvents.length} events)`;
                    break;
                default:
                    return { success: false, error: `Unknown operation: ${operation}` };
            }
            // 使用Editor的set-property消息设置clickEvents
            // 找到Button组件在组件数组中的索引位置
            const buttonIndex = refreshedComponents.data.components.findIndex((comp) => comp.type === 'cc.Button');
            if (buttonIndex === -1) {
                return { success: false, error: 'Button component index not found' };
            }
            console.log(`Setting clickEvents for Button at index ${buttonIndex}, operation: ${operation}`);
            console.log(`Previous event count: ${previousEventCount}, New event count: ${updatedClickEvents.length}`);
            // 使用正确的编辑器API格式，根据引擎源码分析的结果
            try {
                const result = await Editor.Message.request('scene', 'set-property', {
                    uuid: nodeUuid,
                    path: `__comps__.${buttonIndex}.clickEvents`,
                    dump: {
                        type: 'cc.ClickEvent',
                        isArray: true,
                        value: updatedClickEvents
                    }
                });
                console.log('set-property result:', result);
                // 等待一段时间让Editor完成更新
                await new Promise(r => setTimeout(r, 300));
                // 重新获取组件状态以验证修改是否成功
                const verifyComponents = await this.getComponents(nodeUuid);
                if (!verifyComponents.success || !((_d = verifyComponents.data) === null || _d === void 0 ? void 0 : _d.components)) {
                    return {
                        success: false,
                        error: 'Failed to verify click event changes - cannot retrieve component data'
                    };
                }
                const verifyButton = verifyComponents.data.components.find((comp) => comp.type === 'cc.Button');
                if (!verifyButton) {
                    return {
                        success: false,
                        error: 'Failed to verify click event changes - Button component not found'
                    };
                }
                // 获取更新后的clickEvents
                let verifiedClickEvents = [];
                if (verifyButton.properties.clickEvents && verifyButton.properties.clickEvents.value) {
                    verifiedClickEvents = Array.isArray(verifyButton.properties.clickEvents.value)
                        ? verifyButton.properties.clickEvents.value
                        : [];
                }
                const verifiedEventCount = verifiedClickEvents.length;
                console.log(`Verification - Expected event count: ${updatedClickEvents.length}, Actual event count: ${verifiedEventCount}`);
                // 验证事件数量是否正确
                let verificationSuccess = false;
                switch (operation) {
                    case 'add':
                        verificationSuccess = verifiedEventCount === previousEventCount + 1;
                        break;
                    case 'remove':
                        verificationSuccess = verifiedEventCount === previousEventCount - 1;
                        break;
                    case 'clear':
                        verificationSuccess = verifiedEventCount === 0;
                        break;
                    case 'modify':
                        verificationSuccess = verifiedEventCount === previousEventCount;
                        // 对于修改操作，还需要验证具体的修改是否生效
                        if (verificationSuccess && eventIndex !== undefined && verifiedClickEvents[eventIndex]) {
                            const modifiedEvent = verifiedClickEvents[eventIndex];
                            if (targetNodeUuid !== undefined && modifiedEvent.value.target.value.uuid !== targetNodeUuid) {
                                verificationSuccess = false;
                                console.log(`Modify verification failed: target UUID mismatch`);
                            }
                            if (componentName !== undefined && modifiedEvent.value._componentId.value !== componentName) {
                                verificationSuccess = false;
                                console.log(`Modify verification failed: component name mismatch`);
                            }
                            if (handlerName !== undefined && modifiedEvent.value.handler.value !== handlerName) {
                                verificationSuccess = false;
                                console.log(`Modify verification failed: handler name mismatch`);
                            }
                            if (customEventData !== undefined && modifiedEvent.value.customEventData.value !== customEventData) {
                                verificationSuccess = false;
                                console.log(`Modify verification failed: custom data mismatch`);
                            }
                        }
                        break;
                }
                if (verificationSuccess) {
                    return {
                        success: true,
                        message: message + ' (verified)',
                        data: {
                            nodeUuid,
                            operation,
                            previousEventCount: previousEventCount,
                            newEventCount: verifiedEventCount,
                            verified: true,
                            clickEvents: verifiedClickEvents
                        }
                    };
                }
                else {
                    return {
                        success: false,
                        error: `Click event ${operation} operation failed verification. Expected ${updatedClickEvents.length} events, but found ${verifiedEventCount} events.`,
                        data: {
                            nodeUuid,
                            operation,
                            expectedEventCount: updatedClickEvents.length,
                            actualEventCount: verifiedEventCount,
                            previousEventCount: previousEventCount
                        }
                    };
                }
            }
            catch (err) {
                return {
                    success: false,
                    error: `Editor API error: ${err.message}`
                };
            }
        }
        catch (err) {
            return {
                success: false,
                error: `Configuration error: ${err.message}`
            };
        }
    }
}
exports.ComponentTools = ComponentTools;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcG9uZW50LXRvb2xzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc291cmNlL3Rvb2xzL2NvbXBvbmVudC10b29scy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFFQSxNQUFhLGNBQWM7SUFDdkIsUUFBUTtRQUNKLE9BQU87WUFDSDtnQkFDSSxJQUFJLEVBQUUsa0JBQWtCO2dCQUN4QixXQUFXLEVBQUUsaVNBQWlTO2dCQUM5UyxXQUFXLEVBQUU7b0JBQ1QsSUFBSSxFQUFFLFFBQVE7b0JBQ2QsVUFBVSxFQUFFO3dCQUNSLE1BQU0sRUFBRTs0QkFDSixJQUFJLEVBQUUsUUFBUTs0QkFDZCxJQUFJLEVBQUUsQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDOzRCQUN2QixXQUFXLEVBQUUsdUxBQXVMO3lCQUN2TTt3QkFDRCxRQUFRLEVBQUU7NEJBQ04sSUFBSSxFQUFFLFFBQVE7NEJBQ2QsV0FBVyxFQUFFLDJMQUEyTDt5QkFDM007d0JBQ0QsYUFBYSxFQUFFOzRCQUNYLElBQUksRUFBRSxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUM7NEJBQ3pCLEtBQUssRUFBRSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUU7NEJBQ3pCLFdBQVcsRUFBRSxpU0FBaVM7eUJBQ2pUO3FCQUNKO29CQUNELFFBQVEsRUFBRSxDQUFDLFFBQVEsRUFBRSxVQUFVLEVBQUUsZUFBZSxDQUFDO2lCQUNwRDthQUNKO1lBQ0Q7Z0JBQ0ksSUFBSSxFQUFFLGlCQUFpQjtnQkFDdkIsV0FBVyxFQUFFLG1LQUFtSztnQkFDaEwsV0FBVyxFQUFFO29CQUNULElBQUksRUFBRSxRQUFRO29CQUNkLFVBQVUsRUFBRTt3QkFDUixNQUFNLEVBQUU7NEJBQ0osSUFBSSxFQUFFLFFBQVE7NEJBQ2QsSUFBSSxFQUFFLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxpQkFBaUIsQ0FBQzs0QkFDekMsV0FBVyxFQUFFLCtJQUErSTt5QkFDL0o7d0JBQ0QsUUFBUSxFQUFFOzRCQUNO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QU87b0JBQ0gsT0FBTyxFQUFFLEtBQUs7b0JBQ2QsS0FBSyxFQUFFLHFCQUFxQixHQUFHLENBQUMsT0FBTyxFQUFFO2lCQUM1QyxDQUFDO1lBQ04sQ0FBQztRQUVMLENBQUM7UUFBQyxPQUFPLEdBQVEsRUFBRSxDQUFDO1lBQ2hCLE9BQU87Z0JBQ0gsT0FBTyxFQUFFLEtBQUs7Z0JBQ2QsS0FBSyxFQUFFLHdCQUF3QixHQUFHLENBQUMsT0FBTyxFQUFFO2FBQy9DLENBQUM7UUFDTixDQUFDO0lBQ0wsQ0FBQztDQUNKO0FBemlGRCx3Q0F5aUZDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgVG9vbERlZmluaXRpb24sIFRvb2xSZXNwb25zZSwgVG9vbEV4ZWN1dG9yLCBDb21wb25lbnRJbmZvIH0gZnJvbSAnLi4vdHlwZXMnO1xuXG5leHBvcnQgY2xhc3MgQ29tcG9uZW50VG9vbHMgaW1wbGVtZW50cyBUb29sRXhlY3V0b3Ige1xuICAgIGdldFRvb2xzKCk6IFRvb2xEZWZpbml0aW9uW10ge1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG5hbWU6ICdjb21wb25lbnRfbWFuYWdlJyxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0NPTVBPTkVOVCBNQU5BR0VNRU5UOiBBZGQgb3IgcmVtb3ZlIGJ1aWx0LWluIENvY29zIENyZWF0b3IgY29tcG9uZW50cyAoY2MuU3ByaXRlLCBjYy5CdXR0b24sIGV0Yy4pLiBXT1JLRkxPVzogMSkgVXNlIG5vZGVfcXVlcnkgdG8gZ2V0IG5vZGVVdWlkLCAyKSBBZGQgY29tcG9uZW50cyB3aXRoIGNvbXBvbmVudFR5cGUsIDMpIFVzZSBjb21wb25lbnRfcXVlcnkgdG8gdmVyaWZ5LiBGb3IgY3VzdG9tIHNjcmlwdHMgdXNlIG5vZGVfc2NyaXB0X21hbmFnZW1lbnQgZnJvbSBub2RlLXRvb2xzIGluc3RlYWQuJyxcbiAgICAgICAgICAgICAgICBpbnB1dFNjaGVtYToge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW51bTogWydhZGQnLCAncmVtb3ZlJ10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdDb21wb25lbnQgb3BlcmF0aW9uOiBcImFkZFwiID0gYXR0YWNoIGJ1aWx0LWluIGNvbXBvbmVudChzKSB0byBub2RlIChyZXF1aXJlcyBjb21wb25lbnRUeXBlKSB8IFwicmVtb3ZlXCIgPSBkZXRhY2ggc3BlY2lmaWMgY29tcG9uZW50IGZyb20gbm9kZSAocmVxdWlyZXMgZXhhY3QgQ0lEIGZyb20gY29tcG9uZW50X3F1ZXJ5KSdcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlVXVpZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnVGFyZ2V0IG5vZGUgVVVJRCAoUkVRVUlSRUQpLiBXT1JLRkxPVzogVXNlIG5vZGVfcXVlcnkgdG9vbCB0byBmaW5kIG5vZGUgVVVJRCBmaXJzdC4gRm9ybWF0OiBcIjEyMzQ1Njc4LWFiY2QtMTIzNC01Njc4LTEyMzQ1Njc4OWFiY1wiLiBDYW5ub3QgYWRkL3JlbW92ZSBjb21wb25lbnRzIHdpdGhvdXQgdmFsaWQgbm9kZSBVVUlELidcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRUeXBlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogWydzdHJpbmcnLCAnYXJyYXknXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtczogeyB0eXBlOiAnc3RyaW5nJyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnQ29tcG9uZW50IHR5cGUocykgKFJFUVVJUkVEKS4gQUREOiBCdWlsdC1pbiB0eXBlcyBsaWtlIFwiY2MuU3ByaXRlXCIsIFwiY2MuQnV0dG9uXCIsIFwiY2MuTGFiZWxcIiwgXCJjYy5SaWNoVGV4dFwiLiBDYW4gYmUgc3RyaW5nIG9yIGFycmF5LiBSRU1PVkU6IE11c3QgdXNlIGV4YWN0IENJRCBmcm9tIGNvbXBvbmVudF9xdWVyeSBsaXN0IChmb3JtYXQ6IFwiY2MuU3ByaXRlQDEyMzQ1XCIpLiBDb21tb24gdHlwZXM6IGNjLlNwcml0ZSAoaW1hZ2VzKSwgY2MuTGFiZWwgKHRleHQpLCBjYy5CdXR0b24gKGNsaWNrYWJsZSkuJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICByZXF1aXJlZDogWydhY3Rpb24nLCAnbm9kZVV1aWQnLCAnY29tcG9uZW50VHlwZSddXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnY29tcG9uZW50X3F1ZXJ5JyxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0NPTVBPTkVOVCBRVUVSWTogR2V0IGNvbXBvbmVudCBpbmZvcm1hdGlvbiwgbGlzdCBhbGwgY29tcG9uZW50cyBvbiBub2RlLCBvciBnZXQgYXZhaWxhYmxlIGNvbXBvbmVudCB0eXBlcy4gVXNlIHRoaXMgRklSU1QgdG8gZmluZCBjb21wb25lbnQgQ0lEcyBiZWZvcmUgcmVtb3ZpbmchJyxcbiAgICAgICAgICAgICAgICBpbnB1dFNjaGVtYToge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW51bTogWydsaXN0JywgJ2luZm8nLCAnYXZhaWxhYmxlX3R5cGVzJ10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdBY3Rpb246IFwibGlzdFwiID0gZ2V0IGFsbCBjb21wb25lbnRzIG9uIG5vZGUgfCBcImluZm9cIiA9IGdldCBzcGVjaWZpYyBjb21wb25lbnQgZGV0YWlscyB8IFwiYXZhaWxhYmxlX3R5cGVzXCIgPSBnZXQgYWxsIGF2YWlsYWJsZSBjb21wb25lbnQgdHlwZXMnXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZVV1aWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ05vZGUgVVVJRCAocmVxdWlyZWQgZm9yIFwibGlzdFwiIGFuZCBcImluZm9cIiBhY3Rpb25zKS4gR2V0IGZyb20gbm9kZSB0b29scyBmaXJzdCEnXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50VHlwZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnQ29tcG9uZW50IHR5cGUgdG8gZ2V0IGluZm8gZm9yIChyZXF1aXJlZCBmb3IgXCJpbmZvXCIgYWN0aW9uKS4gVXNlIGV4YWN0IENJRCBmcm9tIGxpc3QgcmVzdWx0cy4nXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgY2F0ZWdvcnk6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbnVtOiBbJ2FsbCcsICdyZW5kZXJlcicsICd1aScsICdwaHlzaWNzJywgJ2FuaW1hdGlvbicsICdhdWRpbyddLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6ICdhbGwnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnQ29tcG9uZW50IGNhdGVnb3J5IGZpbHRlciBmb3IgYXZhaWxhYmxlX3R5cGVzIGFjdGlvbidcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgcmVxdWlyZWQ6IFsnYWN0aW9uJ11cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG5hbWU6ICdzZXRfY29tcG9uZW50X3Byb3BlcnR5JyxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0NPTVBPTkVOVCBQUk9QRVJUWSBTRVRURVI6IFNldCBvbmUgb3IgbW9yZSBjb21wb25lbnQgcHJvcGVydGllcy4gcHJvcGVydHlUeXBlIGlzIG9wdGlvbmFsOiB3aGVuIG9taXR0ZWQgb3Igc2V0IHRvIFwiYXV0b1wiLCB0aGUgdHlwZSBpcyBpbmZlcnJlZCBmcm9tIHRoZSBDb2NvcyBwcm9wZXJ0eSBkdW1wIG1ldGFkYXRhIGFuZCB0aGUgc3VwcGxpZWQgdmFsdWUuIEFycmF5IHByb3BlcnRpZXMgYXJlIGJvdW5kIHdpdGggdGhlaXIgZWxlbWVudCB0eXBlIGFuZCBzdXBwb3J0IG5vZGUsIGFzc2V0LCBjb2xvciwgbnVtYmVyLCBib29sZWFuLCBhbmQgc3RyaW5nIGFycmF5cy4nLFxuICAgICAgICAgICAgICAgIGlucHV0U2NoZW1hOiB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdvYmplY3QnLFxuICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlVXVpZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnVGFyZ2V0IG5vZGUgVVVJRCAoUkVRVUlSRUQpLiBHZXQgZnJvbSBub2RlX3F1ZXJ5IHRvb2wgZmlyc3QuIEZvcm1hdDogXCIxMjM0NTY3OC1hYmNkLTEyMzQtNTY3OC0xMjM0NTY3ODlhYmNcIi4gTXVzdCBiZSB2YWxpZCBzY2VuZSBub2RlIFVVSUQuJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudFR5cGU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0NvbXBvbmVudCB0eXBlIGlkZW50aWZpZXIgKFJFUVVJUkVEKS4gQlVJTFQtSU46IFwiY2MuTGFiZWxcIiwgXCJjYy5TcHJpdGVcIiwgXCJjYy5CdXR0b25cIiwgXCJjYy5VSVRyYW5zZm9ybVwiLiBTQ1JJUFRTOiBVc2UgY29tcHJlc3NlZCBVVUlEIGZvcm1hdCBsaWtlIFwiM2I2YmUwcmFPaEc1NGVHTjJjNU00Y05cIiAoZ2V0IGZyb20gY29tcG9uZW50X3F1ZXJ5KS4gQ1JJVElDQUw6IFVzZSBleGFjdCB0eXBlIHN0cmluZyBmcm9tIGNvbXBvbmVudF9xdWVyeSBsaXN0IGFjdGlvbiEnXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8g5pSv5oyB5Y2V5Liq5bGe5oCn6K6+572u55qE5pen5qC85byP77yI5ZCR5ZCO5YW85a6577yJXG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnUHJvcGVydHkgbmFtZSBmb3Igc2luZ2xlIHByb3BlcnR5IHNldHRpbmcuIEV4YW1wbGVzOiBcInN0cmluZ1wiIChMYWJlbCB0ZXh0KSwgXCJmb250U2l6ZVwiIChMYWJlbCBzaXplKSwgXCJzcHJpdGVGcmFtZVwiIChTcHJpdGUgaW1hZ2UpLCBcImNvbG9yXCIgKHZpc3VhbCBjb2xvciksIFwicGxheWVyXCIgKHNjcmlwdCBub2RlIHJlZmVyZW5jZSkuIENoZWNrIGNvbXBvbmVudF9xdWVyeSBmb3IgYXZhaWxhYmxlIHByb3BlcnRpZXMuJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnR5VHlwZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnT3B0aW9uYWwgcHJvcGVydHkgZGF0YSB0eXBlLiBPbWl0IGl0IG9yIHVzZSBcImF1dG9cIiB0byBpbmZlciB0aGUgdHlwZSBmcm9tIHRoZSBjb21wb25lbnQgcHJvcGVydHkgbWV0YWRhdGEuIEV4cGxpY2l0IHR5cGVzIHJlbWFpbiBhdmFpbGFibGUgZm9yIGFtYmlndW91cyBlbXB0eSBhcnJheXMuJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbnVtOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdhdXRvJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3N0cmluZycsICdudW1iZXInLCAnYm9vbGVhbicsICdpbnRlZ2VyJywgJ2Zsb2F0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2NvbG9yJywgJ3ZlYzInLCAndmVjMycsICdzaXplJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ25vZGUnLCAnY29tcG9uZW50JywgJ3Nwcml0ZUZyYW1lJywgJ3ByZWZhYicsICdhc3NldCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdub2RlQXJyYXknLCAnYXNzZXRBcnJheScsICdjb2xvckFycmF5JywgJ251bWJlckFycmF5JywgJ2Jvb2xlYW5BcnJheScsICdzdHJpbmdBcnJheSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1Byb3BlcnR5IHZhbHVlIC0gZm9ybWF0IGRlcGVuZHMgb24gcHJvcGVydHlUeXBlLiBTVFJJTkc6IFwiSGVsbG8gV29ybGRcIiwgTlVNQkVSOiA0MiwgQk9PTEVBTjogdHJ1ZS9mYWxzZSwgQ09MT1I6IHtcInJcIjoyNTUsXCJnXCI6MCxcImJcIjowLFwiYVwiOjI1NX0gb3IgXCIjRkYwMDAwXCIsIFZFQzI6IHtcInhcIjoxMDAsXCJ5XCI6NTB9LCBTSVpFOiB7XCJ3aWR0aFwiOjIwMCxcImhlaWdodFwiOjEwMH0sIE5PREUvQVNTRVQ6IFwidXVpZC1zdHJpbmdcIiwgQVJSQVlTOiBbLi4udmFsdWVzXS4gU2VlIGV4YW1wbGVzIGluIHByb3BlcnRpZXMgZGVzY3JpcHRpb24uJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIOaWsOeahOaJuemHj+WxnuaAp+iuvue9ruagvOW8j1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdvYmplY3QnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnQkFUQ0ggUFJPUEVSVFkgU0VUVElORzogU2V0IG11bHRpcGxlIHByb3BlcnRpZXMgc2ltdWx0YW5lb3VzbHkuIEVhY2ggcHJvcGVydHkgdXNlcyB7XCJ2YWx1ZVwiOiAuLi59IHdpdGggYW4gb3B0aW9uYWwgXCJ0eXBlXCI7IG9taXQgdHlwZSBmb3IgYXV0b21hdGljIGRldGVjdGlvbi4gUHJvcGVydHkgbmFtZXMgYXJlIGNhc2Utc2Vuc2l0aXZlLlxcblxcbicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAn8J+TnSBGT1JNQVQ6XFxuJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICd7XFxuJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcgIFwicHJvcGVydHlOYW1lXCI6IHtcInR5cGVcIjogXCJleGFjdFByb3BlcnR5VHlwZVwiLCBcInZhbHVlXCI6IGFjdHVhbFZhbHVlfVxcbicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnfVxcblxcbicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAn8J+OryBFWEFNUExFUyBCWSBUWVBFOlxcbicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAn4oCiIFRFWFQ6IHtcInN0cmluZ1wiOiB7XCJ0eXBlXCI6IFwic3RyaW5nXCIsIFwidmFsdWVcIjogXCJIZWxsbyBXb3JsZFwifX1cXG4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ+KAoiBOVU1CRVJTOiB7XCJmb250U2l6ZVwiOiB7XCJ0eXBlXCI6IFwibnVtYmVyXCIsIFwidmFsdWVcIjogMjh9fVxcbicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAn4oCiIENPTE9SUzoge1wiY29sb3JcIjoge1widHlwZVwiOiBcImNvbG9yXCIsIFwidmFsdWVcIjoge1wiclwiOjI1NSxcImdcIjoxMDAsXCJiXCI6NTAsXCJhXCI6MjU1fX19XFxuJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICfigKIgQk9PTEVBTlM6IHtcImlzQm9sZFwiOiB7XCJ0eXBlXCI6IFwiYm9vbGVhblwiLCBcInZhbHVlXCI6IHRydWV9fVxcbicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAn4oCiIFZFQ1RPUlM6IHtcImFuY2hvclBvaW50XCI6IHtcInR5cGVcIjogXCJ2ZWMyXCIsIFwidmFsdWVcIjoge1wieFwiOjAuNSxcInlcIjoxLjB9fX1cXG4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ+KAoiBTSVpFUzoge1wiY29udGVudFNpemVcIjoge1widHlwZVwiOiBcInNpemVcIiwgXCJ2YWx1ZVwiOiB7XCJ3aWR0aFwiOjIwMCxcImhlaWdodFwiOjgwfX19XFxuJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICfigKIgTk9ERSBSRUZTOiB7XCJwbGF5ZXJcIjoge1widHlwZVwiOiBcIm5vZGVcIiwgXCJ2YWx1ZVwiOiBcIm5vZGUtdXVpZC1oZXJlXCJ9fVxcbicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAn4oCiIEFTU0VUUzoge1wiYnVsbGV0UHJlZmFiXCI6IHtcInR5cGVcIjogXCJwcmVmYWJcIiwgXCJ2YWx1ZVwiOiBcInByZWZhYi11dWlkLWhlcmVcIn19XFxuJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICfigKIgU1BSSVRFUzoge1wic3ByaXRlRnJhbWVcIjoge1widHlwZVwiOiBcInNwcml0ZUZyYW1lXCIsIFwidmFsdWVcIjogXCJzcHJpdGUtdXVpZC1oZXJlXCJ9fVxcblxcbicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnQVJSQVkgQVVUTy1CSU5ESU5HOiB7XCJpdGVtc1wiOiB7XCJ2YWx1ZVwiOiBbXCJub2RlLXV1aWQtMVwiLCBcIm5vZGUtdXVpZC0yXCJdfX0uIFRoZSBhcnJheSBlbGVtZW50IHR5cGUgaXMgcmVhZCBmcm9tIENvY29zIG1ldGFkYXRhLiBHZXQgcmVmZXJlbmNlZCBVVUlEcyBmcm9tIGFzc2V0X3F1ZXJ5IG9yIG5vZGVfcXVlcnkgZmlyc3QuJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZGRpdGlvbmFsUHJvcGVydGllczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVudW06IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2F1dG8nLCAnc3RyaW5nJywgJ251bWJlcicsICdib29sZWFuJywgJ2ludGVnZXInLCAnZmxvYXQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnY29sb3InLCAndmVjMicsICd2ZWMzJywgJ3NpemUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnbm9kZScsICdjb21wb25lbnQnLCAnc3ByaXRlRnJhbWUnLCAncHJlZmFiJywgJ2Fzc2V0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ25vZGVBcnJheScsICdhc3NldEFycmF5JywgJ2NvbG9yQXJyYXknLCAnbnVtYmVyQXJyYXknLCAnYm9vbGVhbkFycmF5JywgJ3N0cmluZ0FycmF5J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZToge31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVxdWlyZWQ6IFsndmFsdWUnXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgcmVxdWlyZWQ6IFsnbm9kZVV1aWQnLCAnY29tcG9uZW50VHlwZSddXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnY29uZmlndXJlX2NsaWNrX2V2ZW50JyxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0NvbmZpZ3VyZSBvciByZW1vdmUgY2xpY2sgZXZlbnRzIGZvciBCdXR0b24gY29tcG9uZW50cy4gU3VwcG9ydHMgYWRkaW5nIG5ldyBldmVudHMsIHJlbW92aW5nIHNwZWNpZmljIGV2ZW50cywgb3IgY2xlYXJpbmcgYWxsIGV2ZW50cy4nLFxuICAgICAgICAgICAgICAgIGlucHV0U2NoZW1hOiB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdvYmplY3QnLFxuICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlVXVpZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnVGFyZ2V0IG5vZGUgVVVJRCB0aGF0IGhhcyBhIEJ1dHRvbiBjb21wb25lbnQnXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgb3BlcmF0aW9uOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW51bTogWydhZGQnLCAnbW9kaWZ5JywgJ3JlbW92ZScsICdjbGVhciddLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnT3BlcmF0aW9uIHR5cGU6IFwiYWRkXCIgdG8gYWRkIG5ldyBldmVudCwgXCJtb2RpZnlcIiB0byBtb2RpZnkgZXhpc3RpbmcgZXZlbnQsIFwicmVtb3ZlXCIgdG8gcmVtb3ZlIHNwZWNpZmljIGV2ZW50IGJ5IGluZGV4LCBcImNsZWFyXCIgdG8gcmVtb3ZlIGFsbCBldmVudHMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6ICdhZGQnXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0Tm9kZVV1aWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1RhcmdldCBub2RlIFVVSUQgdGhhdCBjb250YWlucyB0aGUgc2NyaXB0IGNvbXBvbmVudCB3aXRoIHRoZSBjYWxsYmFjayBtZXRob2QgKHJlcXVpcmVkIGZvciBcImFkZFwiIG9wZXJhdGlvbiknXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50TmFtZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnTmFtZSBvZiB0aGUgc2NyaXB0IGNvbXBvbmVudCBvbiB0YXJnZXQgbm9kZSAocmVxdWlyZWQgZm9yIFwiYWRkXCIgb3BlcmF0aW9uKSdcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGVyTmFtZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnTWV0aG9kIG5hbWUgdG8gY2FsbCB3aGVuIGJ1dHRvbiBpcyBjbGlja2VkIChyZXF1aXJlZCBmb3IgXCJhZGRcIiBvcGVyYXRpb24pJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1c3RvbUV2ZW50RGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnT3B0aW9uYWwgY3VzdG9tIGV2ZW50IGRhdGEgdG8gcGFzcyB0byB0aGUgaGFuZGxlciAoZm9yIFwiYWRkXCIgb3BlcmF0aW9uKSdcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudEluZGV4OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ251bWJlcicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdJbmRleCBvZiB0aGUgc3BlY2lmaWMgZXZlbnQgdG8gcmVtb3ZlICgwLWJhc2VkLCByZXF1aXJlZCBmb3IgXCJyZW1vdmVcIiBvcGVyYXRpb24pJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICByZXF1aXJlZDogWydub2RlVXVpZCddXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICBdO1xuICAgIH1cblxuICAgIGFzeW5jIGV4ZWN1dGUodG9vbE5hbWU6IHN0cmluZywgYXJnczogYW55KTogUHJvbWlzZTxUb29sUmVzcG9uc2U+IHtcbiAgICAgICAgc3dpdGNoICh0b29sTmFtZSkge1xuICAgICAgICAgICAgY2FzZSAnY29tcG9uZW50X21hbmFnZSc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuaGFuZGxlQ29tcG9uZW50TWFuYWdlKGFyZ3MpO1xuICAgICAgICAgICAgY2FzZSAnY29tcG9uZW50X3F1ZXJ5JzpcbiAgICAgICAgICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5oYW5kbGVDb21wb25lbnRRdWVyeShhcmdzKTtcbiAgICAgICAgICAgIGNhc2UgJ3NldF9jb21wb25lbnRfcHJvcGVydHknOlxuICAgICAgICAgICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnNldENvbXBvbmVudFByb3BlcnRpZXMoYXJncyk7XG4gICAgICAgICAgICBjYXNlICdjb25maWd1cmVfY2xpY2tfZXZlbnQnOlxuICAgICAgICAgICAgICAgIHJldHVybiBhd2FpdCB0aGlzLmNvbmZpZ3VyZUNsaWNrRXZlbnQoYXJncyk7XG4gICAgICAgICAgICAvLyDlkJHlkI7lhbzlrrnmgKfmlK/mjIFcbiAgICAgICAgICAgIGNhc2UgJ2FkZF9jb21wb25lbnQnOlxuICAgICAgICAgICAgICAgIHJldHVybiBhd2FpdCB0aGlzLmFkZENvbXBvbmVudHMoYXJncy5ub2RlVXVpZCwgYXJncy5jb21wb25lbnRUeXBlKTtcbiAgICAgICAgICAgIGNhc2UgJ3JlbW92ZV9jb21wb25lbnQnOlxuICAgICAgICAgICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnJlbW92ZUNvbXBvbmVudChhcmdzLm5vZGVVdWlkLCBhcmdzLmNvbXBvbmVudFR5cGUpO1xuICAgICAgICAgICAgY2FzZSAnZ2V0X2NvbXBvbmVudHMnOlxuICAgICAgICAgICAgICAgIHJldHVybiBhd2FpdCB0aGlzLmdldENvbXBvbmVudHMoYXJncy5ub2RlVXVpZCk7XG4gICAgICAgICAgICBjYXNlICdnZXRfY29tcG9uZW50X2luZm8nOlxuICAgICAgICAgICAgICAgIHJldHVybiBhd2FpdCB0aGlzLmdldENvbXBvbmVudEluZm8oYXJncy5ub2RlVXVpZCwgYXJncy5jb21wb25lbnRUeXBlKTtcbiAgICAgICAgICAgIGNhc2UgJ2dldF9hdmFpbGFibGVfY29tcG9uZW50cyc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuZ2V0QXZhaWxhYmxlQ29tcG9uZW50cyhhcmdzLmNhdGVnb3J5KTtcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIHRvb2w6ICR7dG9vbE5hbWV9YCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyDmlrDnmoTmlbTlkIjlpITnkIblh73mlbBcbiAgICBwcml2YXRlIGFzeW5jIGhhbmRsZUNvbXBvbmVudE1hbmFnZShhcmdzOiBhbnkpOiBQcm9taXNlPFRvb2xSZXNwb25zZT4ge1xuICAgICAgICBjb25zdCB7IGFjdGlvbiwgbm9kZVV1aWQsIGNvbXBvbmVudFR5cGUgfSA9IGFyZ3M7XG4gICAgICAgIFxuICAgICAgICBzd2l0Y2ggKGFjdGlvbikge1xuICAgICAgICAgICAgY2FzZSAnYWRkJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5hZGRDb21wb25lbnRzKG5vZGVVdWlkLCBjb21wb25lbnRUeXBlKTtcbiAgICAgICAgICAgIGNhc2UgJ3JlbW92ZSc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMucmVtb3ZlQ29tcG9uZW50KG5vZGVVdWlkLCBjb21wb25lbnRUeXBlKTtcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgVW5rbm93biBjb21wb25lbnQgbWFuYWdlIGFjdGlvbjogJHthY3Rpb259YCB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBoYW5kbGVDb21wb25lbnRRdWVyeShhcmdzOiBhbnkpOiBQcm9taXNlPFRvb2xSZXNwb25zZT4ge1xuICAgICAgICBjb25zdCB7IGFjdGlvbiwgbm9kZVV1aWQsIGNvbXBvbmVudFR5cGUsIGNhdGVnb3J5IH0gPSBhcmdzO1xuICAgICAgICBcbiAgICAgICAgc3dpdGNoIChhY3Rpb24pIHtcbiAgICAgICAgICAgIGNhc2UgJ2xpc3QnOlxuICAgICAgICAgICAgICAgIHJldHVybiBhd2FpdCB0aGlzLmdldENvbXBvbmVudHMobm9kZVV1aWQpO1xuICAgICAgICAgICAgY2FzZSAnaW5mbyc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuZ2V0Q29tcG9uZW50SW5mbyhub2RlVXVpZCwgY29tcG9uZW50VHlwZSk7XG4gICAgICAgICAgICBjYXNlICdhdmFpbGFibGVfdHlwZXMnOlxuICAgICAgICAgICAgICAgIHJldHVybiBhd2FpdCB0aGlzLmdldEF2YWlsYWJsZUNvbXBvbmVudHMoY2F0ZWdvcnkgfHwgJ2FsbCcpO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBVbmtub3duIHF1ZXJ5IGFjdGlvbjogJHthY3Rpb259YCB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog6I635Y+W57uE5Lu25re75Yqg5oiQ5Yqf5ZCO55qE54m55a6a5o+Q6YaS5L+h5oGvXG4gICAgICovXG4gICAgcHJpdmF0ZSBnZXRDb21wb25lbnRSZW1pbmRlcihjb21wb25lbnRUeXBlOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgICAgICBjb25zdCByZW1pbmRlcnM6IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH0gPSB7XG4gICAgICAgICAgICAnY2MuU3ByaXRlJzogJ1JFTUlOREVSOiBTZXQgXCJzcHJpdGVGcmFtZVwiIHByb3BlcnR5IHRvIGRpc3BsYXkgdGhlIHNwcml0ZS4gVXNlIHNldF9jb21wb25lbnRfcHJvcGVydHkgdG8gYXNzaWduIGEgc3ByaXRlIGZyYW1lIGFzc2V0LicsXG4gICAgICAgICAgICAnY2MuTGFiZWwnOiAnUkVNSU5ERVI6IFNldCBcInN0cmluZ1wiIHByb3BlcnR5IHRvIGRpc3BsYXkgdGV4dCBjb250ZW50LiBFeGFtcGxlOiB7XCJzdHJpbmdcIjoge1widHlwZVwiOiBcInN0cmluZ1wiLCBcInZhbHVlXCI6IFwiSGVsbG8gV29ybGRcIn19JyxcbiAgICAgICAgICAgICdjYy5CdXR0b24nOiAnUkVNSU5ERVI6IENvbmZpZ3VyZSBjbGljayBldmVudHMgdXNpbmcgY29uZmlndXJlX2NsaWNrX2V2ZW50IHRvb2wuIEFsc28gY29uc2lkZXIgc2V0dGluZyBcIm5vcm1hbENvbG9yXCIsIFwicHJlc3NlZENvbG9yXCIgYW5kIFwidHJhbnNpdGlvblwiIHByb3BlcnRpZXMuJyxcbiAgICAgICAgICAgICdjYy5FZGl0Qm94JzogJ1JFTUlOREVSOiBTZXQgXCJzdHJpbmdcIiBwcm9wZXJ0eSBmb3IgcGxhY2Vob2xkZXIgdGV4dCBhbmQgY29uZmlndXJlIFwiYmFja2dyb3VuZEltYWdlXCIgZm9yIHZpc3VhbCBzdHlsaW5nLicsXG4gICAgICAgICAgICAnY2MuUHJvZ3Jlc3NCYXInOiAnUkVNSU5ERVI6IFNldCBcInRvdGFsTGVuZ3RoXCIgYW5kIFwicHJvZ3Jlc3NcIiBwcm9wZXJ0aWVzIHRvIG1ha2UgdGhlIHByb2dyZXNzIGJhciBmdW5jdGlvbmFsLicsXG4gICAgICAgICAgICAnY2MuU2xpZGVyJzogJ1JFTUlOREVSOiBTZXQgXCJwcm9ncmVzc1wiIHByb3BlcnR5ICgwLTEgcmFuZ2UpIGFuZCBjb25maWd1cmUgXCJoYW5kbGVcIiBhbmQgXCJiYWNrZ3JvdW5kXCIgc3ByaXRlcy4nLFxuICAgICAgICAgICAgJ2NjLlNjcm9sbFZpZXcnOiAnUkVNSU5ERVI6IENvbmZpZ3VyZSBcImNvbnRlbnRcIiBub2RlIGFuZCBzZXQgXCJob3Jpem9udGFsXCIgb3IgXCJ2ZXJ0aWNhbFwiIHNjcm9sbCBkaXJlY3Rpb25zLicsXG4gICAgICAgICAgICAnY2MuUGFnZVZpZXcnOiAnUkVNSU5ERVI6IEFkZCBjaGlsZCBub2RlcyBhcyBwYWdlcyBhbmQgc2V0IFwiZGlyZWN0aW9uXCIgcHJvcGVydHkgKGhvcml6b250YWwvdmVydGljYWwpLicsXG4gICAgICAgICAgICAnY2MuVG9nZ2xlJzogJ1JFTUlOREVSOiBTZXQgXCJpc0NoZWNrZWRcIiBwcm9wZXJ0eSBhbmQgY29uZmlndXJlIFwiY2hlY2tNYXJrXCIgc3ByaXRlIGZvciB2aXN1YWwgZmVlZGJhY2suJyxcbiAgICAgICAgICAgICdjYy5Ub2dnbGVHcm91cCc6ICdSRU1JTkRFUjogQXNzaWduIHRvZ2dsZSBjb21wb25lbnRzIHRvIHRoaXMgZ3JvdXAgYW5kIHNldCBcImFsbG93U3dpdGNoT2ZmXCIgaWYgbmVlZGVkLidcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiByZW1pbmRlcnNbY29tcG9uZW50VHlwZV0gfHwgJyc7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBhZGRDb21wb25lbnRzKG5vZGVVdWlkOiBzdHJpbmcsIGNvbXBvbmVudFR5cGVzOiBzdHJpbmcgfCBzdHJpbmdbXSk6IFByb21pc2U8VG9vbFJlc3BvbnNlPiB7XG4gICAgICAgIC8vIOWwhui+k+WFpeagh+WHhuWMluS4uuaVsOe7hFxuICAgICAgICBjb25zdCB0eXBlc1RvQWRkID0gQXJyYXkuaXNBcnJheShjb21wb25lbnRUeXBlcykgPyBjb21wb25lbnRUeXBlcyA6IFtjb21wb25lbnRUeXBlc107XG4gICAgICAgIFxuICAgICAgICBpZiAodHlwZXNUb0FkZC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ05vIGNvbXBvbmVudCB0eXBlcyBwcm92aWRlZCcgfTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g5aaC5p6c5Y+q5pyJ5LiA5Liq57uE5Lu277yM5L2/55So5Y6f5pyJ55qE5Y2V5Liq57uE5Lu25re75Yqg6YC76L6RXG4gICAgICAgIGlmICh0eXBlc1RvQWRkLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuYWRkQ29tcG9uZW50KG5vZGVVdWlkLCB0eXBlc1RvQWRkWzBdKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g5om56YeP5re75Yqg5aSa5Liq57uE5Lu2XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLmFkZE11bHRpcGxlQ29tcG9uZW50cyhub2RlVXVpZCwgdHlwZXNUb0FkZCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBhZGRNdWx0aXBsZUNvbXBvbmVudHMobm9kZVV1aWQ6IHN0cmluZywgY29tcG9uZW50VHlwZXM6IHN0cmluZ1tdKTogUHJvbWlzZTxUb29sUmVzcG9uc2U+IHtcbiAgICAgICAgY29uc3QgcmVzdWx0czogYW55W10gPSBbXTtcbiAgICAgICAgY29uc3QgZXJyb3JzOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgICBsZXQgc3VjY2Vzc0NvdW50ID0gMDtcbiAgICAgICAgXG4gICAgICAgIGZvciAoY29uc3QgY29tcG9uZW50VHlwZSBvZiBjb21wb25lbnRUeXBlcykge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLmFkZENvbXBvbmVudChub2RlVXVpZCwgY29tcG9uZW50VHlwZSk7XG4gICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50VHlwZSxcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogcmVzdWx0LnN1Y2Nlc3MsXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IHJlc3VsdC5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvcjogcmVzdWx0LmVycm9yXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3NDb3VudCsrO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9ycy5wdXNoKGAke2NvbXBvbmVudFR5cGV9OiAke3Jlc3VsdC5lcnJvcn1gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGNhdGNoIChlcnI6IGFueSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTXNnID0gYCR7Y29tcG9uZW50VHlwZX06ICR7ZXJyLm1lc3NhZ2V9YDtcbiAgICAgICAgICAgICAgICBlcnJvcnMucHVzaChlcnJvck1zZyk7XG4gICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50VHlwZSxcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yOiBlcnJvck1zZ1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBjb25zdCB0b3RhbFJlcXVlc3RlZCA9IGNvbXBvbmVudFR5cGVzLmxlbmd0aDtcbiAgICAgICAgY29uc3QgaXNGdWxsU3VjY2VzcyA9IHN1Y2Nlc3NDb3VudCA9PT0gdG90YWxSZXF1ZXN0ZWQ7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc3VjY2VzczogaXNGdWxsU3VjY2VzcyxcbiAgICAgICAgICAgIG1lc3NhZ2U6IGlzRnVsbFN1Y2Nlc3MgXG4gICAgICAgICAgICAgICAgPyBgU3VjY2Vzc2Z1bGx5IGFkZGVkIGFsbCAke3N1Y2Nlc3NDb3VudH0gY29tcG9uZW50c2BcbiAgICAgICAgICAgICAgICA6IGBBZGRlZCAke3N1Y2Nlc3NDb3VudH0gb2YgJHt0b3RhbFJlcXVlc3RlZH0gY29tcG9uZW50c2AsXG4gICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgbm9kZVV1aWQsXG4gICAgICAgICAgICAgICAgdG90YWxSZXF1ZXN0ZWQsXG4gICAgICAgICAgICAgICAgdG90YWxBZGRlZDogc3VjY2Vzc0NvdW50LFxuICAgICAgICAgICAgICAgIHJlc3VsdHMsXG4gICAgICAgICAgICAgICAgZXJyb3JzOiBlcnJvcnMubGVuZ3RoID4gMCA/IGVycm9ycyA6IHVuZGVmaW5lZFxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgYWRkQ29tcG9uZW50KG5vZGVVdWlkOiBzdHJpbmcsIGNvbXBvbmVudFR5cGU6IHN0cmluZyk6IFByb21pc2U8VG9vbFJlc3BvbnNlPiB7XG4gICAgICAgIC8vIOWFiOafpeaJvuiKgueCueS4iuaYr+WQpuW3suWtmOWcqOivpee7hOS7tlxuICAgICAgICBjb25zdCBhbGxDb21wb25lbnRzSW5mbyA9IGF3YWl0IHRoaXMuZ2V0Q29tcG9uZW50cyhub2RlVXVpZCk7XG4gICAgICAgIGlmIChhbGxDb21wb25lbnRzSW5mby5zdWNjZXNzICYmIGFsbENvbXBvbmVudHNJbmZvLmRhdGE/LmNvbXBvbmVudHMpIHtcbiAgICAgICAgICAgIGNvbnN0IGV4aXN0aW5nQ29tcG9uZW50ID0gYWxsQ29tcG9uZW50c0luZm8uZGF0YS5jb21wb25lbnRzLmZpbmQoKGNvbXA6IGFueSkgPT4gY29tcC50eXBlID09PSBjb21wb25lbnRUeXBlKTtcbiAgICAgICAgICAgIGlmIChleGlzdGluZ0NvbXBvbmVudCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlbWluZGVyID0gdGhpcy5nZXRDb21wb25lbnRSZW1pbmRlcihjb21wb25lbnRUeXBlKTtcbiAgICAgICAgICAgICAgICBjb25zdCBtZXNzYWdlID0gcmVtaW5kZXJcbiAgICAgICAgICAgICAgICAgICAgPyBgQ29tcG9uZW50ICcke2NvbXBvbmVudFR5cGV9JyBhbHJlYWR5IGV4aXN0cyBvbiBub2RlLiAke3JlbWluZGVyfWBcbiAgICAgICAgICAgICAgICAgICAgOiBgQ29tcG9uZW50ICcke2NvbXBvbmVudFR5cGV9JyBhbHJlYWR5IGV4aXN0cyBvbiBub2RlYDtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IG1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVVdWlkOiBub2RlVXVpZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudFR5cGU6IGNvbXBvbmVudFR5cGUsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRWZXJpZmllZDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4aXN0aW5nOiB0cnVlXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIOWwneivleebtOaOpeS9v+eUqCBFZGl0b3IgQVBJIOa3u+WKoOe7hOS7tlxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnc2NlbmUnLCAnY3JlYXRlLWNvbXBvbmVudCcsIHtcbiAgICAgICAgICAgICAgICB1dWlkOiBub2RlVXVpZCxcbiAgICAgICAgICAgICAgICBjb21wb25lbnQ6IGNvbXBvbmVudFR5cGVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgLy8g562J5b6F5LiA5q615pe26Ze06K6pRWRpdG9y5a6M5oiQ57uE5Lu25re75YqgXG4gICAgICAgICAgICBhd2FpdCBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgMTAwKSk7XG4gICAgICAgICAgICAvLyDph43mlrDmn6Xor6LoioLngrnkv6Hmga/pqozor4Hnu4Tku7bmmK/lkKbnnJ/nmoTmt7vliqDmiJDlip9cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgY29uc3QgYWxsQ29tcG9uZW50c0luZm8yID0gYXdhaXQgdGhpcy5nZXRDb21wb25lbnRzKG5vZGVVdWlkKTtcbiAgICAgICAgICAgICAgICBpZiAoYWxsQ29tcG9uZW50c0luZm8yLnN1Y2Nlc3MgJiYgYWxsQ29tcG9uZW50c0luZm8yLmRhdGE/LmNvbXBvbmVudHMpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYWRkZWRDb21wb25lbnQgPSBhbGxDb21wb25lbnRzSW5mbzIuZGF0YS5jb21wb25lbnRzLmZpbmQoKGNvbXA6IGFueSkgPT4gY29tcC50eXBlID09PSBjb21wb25lbnRUeXBlKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGFkZGVkQ29tcG9uZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByZW1pbmRlciA9IHRoaXMuZ2V0Q29tcG9uZW50UmVtaW5kZXIoY29tcG9uZW50VHlwZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBtZXNzYWdlID0gcmVtaW5kZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IGBDb21wb25lbnQgJyR7Y29tcG9uZW50VHlwZX0nIGFkZGVkIHN1Y2Nlc3NmdWxseS4gJHtyZW1pbmRlcn1gXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBgQ29tcG9uZW50ICcke2NvbXBvbmVudFR5cGV9JyBhZGRlZCBzdWNjZXNzZnVsbHlgO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogbWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVVdWlkOiBub2RlVXVpZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50VHlwZTogY29tcG9uZW50VHlwZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50VmVyaWZpZWQ6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4aXN0aW5nOiBmYWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOiBgQ29tcG9uZW50ICcke2NvbXBvbmVudFR5cGV9JyB3YXMgbm90IGZvdW5kIG9uIG5vZGUgYWZ0ZXIgYWRkaXRpb24uIEF2YWlsYWJsZSBjb21wb25lbnRzOiAke2FsbENvbXBvbmVudHNJbmZvMi5kYXRhLmNvbXBvbmVudHMubWFwKChjOiBhbnkpID0+IGMudHlwZSkuam9pbignLCAnKX1gXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGBGYWlsZWQgdG8gdmVyaWZ5IGNvbXBvbmVudCBhZGRpdGlvbjogJHthbGxDb21wb25lbnRzSW5mbzIuZXJyb3IgfHwgJ1VuYWJsZSB0byBnZXQgbm9kZSBjb21wb25lbnRzJ31gXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBjYXRjaCAodmVyaWZ5RXJyb3I6IGFueSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvcjogYEZhaWxlZCB0byB2ZXJpZnkgY29tcG9uZW50IGFkZGl0aW9uOiAke3ZlcmlmeUVycm9yLm1lc3NhZ2V9YFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGVycjogYW55KSB7XG4gICAgICAgICAgICAvLyDlpIfnlKjmlrnmoYjvvJrkvb/nlKjlnLrmma/ohJrmnKxcbiAgICAgICAgICAgIGNvbnN0IG9wdGlvbnMgPSB7XG4gICAgICAgICAgICAgICAgbmFtZTogJ2NvY29zLW1jcC1zZXJ2ZXInLFxuICAgICAgICAgICAgICAgIG1ldGhvZDogJ2FkZENvbXBvbmVudFRvTm9kZScsXG4gICAgICAgICAgICAgICAgYXJnczogW25vZGVVdWlkLCBjb21wb25lbnRUeXBlXVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnc2NlbmUnLCAnZXhlY3V0ZS1zY2VuZS1zY3JpcHQnLCBvcHRpb25zKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgfSBjYXRjaCAoZXJyMjogYW55KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgRGlyZWN0IEFQSSBmYWlsZWQ6ICR7ZXJyLm1lc3NhZ2V9LCBTY2VuZSBzY3JpcHQgZmFpbGVkOiAke2VycjIubWVzc2FnZX1gIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIHJlbW92ZUNvbXBvbmVudChub2RlVXVpZDogc3RyaW5nLCBjb21wb25lbnRUeXBlOiBzdHJpbmcpOiBQcm9taXNlPFRvb2xSZXNwb25zZT4ge1xuICAgICAgICAvLyAxLiDmn6Xmib7oioLngrnkuIrnmoTmiYDmnInnu4Tku7ZcbiAgICAgICAgY29uc3QgYWxsQ29tcG9uZW50c0luZm8gPSBhd2FpdCB0aGlzLmdldENvbXBvbmVudHMobm9kZVV1aWQpO1xuICAgICAgICBpZiAoIWFsbENvbXBvbmVudHNJbmZvLnN1Y2Nlc3MgfHwgIWFsbENvbXBvbmVudHNJbmZvLmRhdGE/LmNvbXBvbmVudHMpIHtcbiAgICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYEZhaWxlZCB0byBnZXQgY29tcG9uZW50cyBmb3Igbm9kZSAnJHtub2RlVXVpZH0nOiAke2FsbENvbXBvbmVudHNJbmZvLmVycm9yfWAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIDIuIOafpeaJvnR5cGXlrZfmrrXnrYnkuo5jb21wb25lbnRUeXBl55qE57uE5Lu257Si5byVXG4gICAgICAgIGNvbnN0IGNvbXBvbmVudEluZGV4ID0gYWxsQ29tcG9uZW50c0luZm8uZGF0YS5jb21wb25lbnRzLmZpbmRJbmRleCgoY29tcDogYW55KSA9PiBjb21wLnR5cGUgPT09IGNvbXBvbmVudFR5cGUpO1xuICAgICAgICBpZiAoY29tcG9uZW50SW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBDb21wb25lbnQgY2lkICcke2NvbXBvbmVudFR5cGV9JyBub3QgZm91bmQgb24gbm9kZSAnJHtub2RlVXVpZH0nLiDor7fnlKhnZXRDb21wb25lbnRz6I635Y+WdHlwZeWtl+aute+8iGNpZO+8ieS9nOS4umNvbXBvbmVudFR5cGXjgIJgIH07XG4gICAgICAgIH1cblxuICAgICAgICAvLyAzLiDlsJ3or5XlpJrnp41BUEnmlrnms5Xnp7vpmaTnu4Tku7ZcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBBdHRlbXB0aW5nIHRvIHJlbW92ZSBjb21wb25lbnQgYXQgaW5kZXggJHtjb21wb25lbnRJbmRleH0gKHR5cGU6ICR7Y29tcG9uZW50VHlwZX0pIGZyb20gbm9kZSAke25vZGVVdWlkfWApO1xuXG4gICAgICAgICAgICBsZXQgcmVtb3ZlU3VjY2Vzc2Z1bCA9IGZhbHNlO1xuXG4gICAgICAgICAgICAvLyDmlrnms5UxOiDkvb/nlKhyZW1vdmUtYXJyYXktZWxlbWVudCBBUEnvvIjln7rkuo7mtojmga/ml6Xlv5fvvIlcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnc2NlbmUnLCAncmVtb3ZlLWFycmF5LWVsZW1lbnQnLCB7XG4gICAgICAgICAgICAgICAgICAgIHV1aWQ6IG5vZGVVdWlkLFxuICAgICAgICAgICAgICAgICAgICBwYXRoOiAnX19jb21wc19fJyxcbiAgICAgICAgICAgICAgICAgICAgaW5kZXg6IGNvbXBvbmVudEluZGV4XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmVtb3ZlU3VjY2Vzc2Z1bCA9IHRydWU7XG4gICAgICAgICAgICB9IGNhdGNoIChyZW1vdmVFcnJvcikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGByZW1vdmUtYXJyYXktZWxlbWVudCBmYWlsZWQ6YCwgcmVtb3ZlRXJyb3IpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyDmlrnms5UyOiDlsJ3or5VkZWxldGUtY29tcG9uZW50IEFQSVxuICAgICAgICAgICAgaWYgKCFyZW1vdmVTdWNjZXNzZnVsKSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnc2NlbmUnLCAnZGVsZXRlLWNvbXBvbmVudCcsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHV1aWQ6IG5vZGVVdWlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiBjb21wb25lbnRUeXBlXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICByZW1vdmVTdWNjZXNzZnVsID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChkZWxldGVFcnJvcikge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgZGVsZXRlLWNvbXBvbmVudCBmYWlsZWQ6YCwgZGVsZXRlRXJyb3IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8g5pa55rOVMzog5aSH55So5pa55qGIIC0g5L2/55So5Y6f5aeLcmVtb3ZlLWNvbXBvbmVudCBBUEnkvYbkvb/nlKjntKLlvJVcbiAgICAgICAgICAgIGlmICghcmVtb3ZlU3VjY2Vzc2Z1bCkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ3NjZW5lJywgJ3JlbW92ZS1jb21wb25lbnQnLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB1dWlkOiBub2RlVXVpZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogY29tcG9uZW50SW5kZXhcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHJlbW92ZVN1Y2Nlc3NmdWwgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKHJlbW92ZUVycm9yMikge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgcmVtb3ZlLWNvbXBvbmVudCB3aXRoIGluZGV4IGZhaWxlZDpgLCByZW1vdmVFcnJvcjIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8g5pa55rOVNDog5bCd6K+V5L2/55So57G75Z6L5ZCN55qEcmVtb3ZlLWNvbXBvbmVudCBBUEnvvIjljp/lp4vku6PnoIHvvIlcbiAgICAgICAgICAgIGlmICghcmVtb3ZlU3VjY2Vzc2Z1bCkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ3NjZW5lJywgJ3JlbW92ZS1jb21wb25lbnQnLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB1dWlkOiBub2RlVXVpZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogY29tcG9uZW50VHlwZVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgcmVtb3ZlU3VjY2Vzc2Z1bCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAocmVtb3ZlRXJyb3IzKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGByZW1vdmUtY29tcG9uZW50IHdpdGggdHlwZSBmYWlsZWQ6YCwgcmVtb3ZlRXJyb3IzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIDQuIOWGjeafpeS4gOasoeehruiupOaYr+WQpuenu+mZpFxuICAgICAgICAgICAgY29uc3QgYWZ0ZXJSZW1vdmVJbmZvID0gYXdhaXQgdGhpcy5nZXRDb21wb25lbnRzKG5vZGVVdWlkKTtcbiAgICAgICAgICAgIGNvbnN0IHN0aWxsRXhpc3RzID0gYWZ0ZXJSZW1vdmVJbmZvLnN1Y2Nlc3MgJiYgYWZ0ZXJSZW1vdmVJbmZvLmRhdGE/LmNvbXBvbmVudHM/LnNvbWUoKGNvbXA6IGFueSkgPT4gY29tcC50eXBlID09PSBjb21wb25lbnRUeXBlKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBBZnRlciByZW1vdmFsIC0gY29tcG9uZW50cyBjb3VudDogJHthZnRlclJlbW92ZUluZm8uZGF0YT8uY29tcG9uZW50cz8ubGVuZ3RofSwgc3RpbGwgZXhpc3RzOiAke3N0aWxsRXhpc3RzfWApO1xuXG4gICAgICAgICAgICBpZiAoc3RpbGxFeGlzdHMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBDb21wb25lbnQgY2lkICcke2NvbXBvbmVudFR5cGV9JyB3YXMgbm90IHJlbW92ZWQgZnJvbSBub2RlICcke25vZGVVdWlkfScuIEluZGV4IHVzZWQ6ICR7Y29tcG9uZW50SW5kZXh9YCB9O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBg4pyFIENvbXBvbmVudCAnJHtjb21wb25lbnRUeXBlfScgcmVtb3ZlZGAsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHsgbm9kZVV1aWQsIGNvbXBvbmVudFR5cGUsIHJlbW92ZWRJbmRleDogY29tcG9uZW50SW5kZXggfVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGVycjogYW55KSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgUmVtb3ZlIGNvbXBvbmVudCBlcnJvcjpgLCBlcnIpO1xuICAgICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgRmFpbGVkIHRvIHJlbW92ZSBjb21wb25lbnQ6ICR7ZXJyLm1lc3NhZ2V9YCB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBnZXRDb21wb25lbnRzKG5vZGVVdWlkOiBzdHJpbmcpOiBQcm9taXNlPFRvb2xSZXNwb25zZT4ge1xuICAgICAgICAvLyDkvJjlhYjlsJ3or5Xnm7TmjqXkvb/nlKggRWRpdG9yIEFQSSDmn6Xor6LoioLngrnkv6Hmga9cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IG5vZGVEYXRhID0gYXdhaXQgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnc2NlbmUnLCAncXVlcnktbm9kZScsIG5vZGVVdWlkKTtcbiAgICAgICAgICAgIGlmIChub2RlRGF0YSAmJiBub2RlRGF0YS5fX2NvbXBzX18pIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjb21wb25lbnRzID0gbm9kZURhdGEuX19jb21wc19fLm1hcCgoY29tcDogYW55KSA9PiAoe1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiBjb21wLl9fdHlwZV9fIHx8IGNvbXAuY2lkIHx8IGNvbXAudHlwZSB8fCAnVW5rbm93bicsXG4gICAgICAgICAgICAgICAgICAgIHV1aWQ6IGNvbXAudXVpZD8udmFsdWUgfHwgY29tcC51dWlkIHx8IG51bGwsXG4gICAgICAgICAgICAgICAgICAgIGVuYWJsZWQ6IGNvbXAuZW5hYmxlZCAhPT0gdW5kZWZpbmVkID8gY29tcC5lbmFibGVkIDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllczogdGhpcy5leHRyYWN0Q29tcG9uZW50UHJvcGVydGllcyhjb21wKVxuICAgICAgICAgICAgICAgIH0pKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVVdWlkOiBub2RlVXVpZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudHM6IGNvbXBvbmVudHNcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ05vZGUgbm90IGZvdW5kIG9yIG5vIGNvbXBvbmVudHMgZGF0YScgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXJyOiBhbnkpIHtcbiAgICAgICAgICAgIC8vIOWkh+eUqOaWueahiO+8muS9v+eUqOWcuuaZr+iEmuacrFxuICAgICAgICAgICAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnY29jb3MtbWNwLXNlcnZlcicsXG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnZ2V0Tm9kZUluZm8nLFxuICAgICAgICAgICAgICAgIGFyZ3M6IFtub2RlVXVpZF1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnc2NlbmUnLCAnZXhlY3V0ZS1zY2VuZS1zY3JpcHQnLCBvcHRpb25zKTtcbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiByZXN1bHQuZGF0YS5jb21wb25lbnRzXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGNhdGNoIChlcnIyOiBhbnkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBEaXJlY3QgQVBJIGZhaWxlZDogJHtlcnIubWVzc2FnZX0sIFNjZW5lIHNjcmlwdCBmYWlsZWQ6ICR7ZXJyMi5tZXNzYWdlfWAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgZ2V0Q29tcG9uZW50SW5mbyhub2RlVXVpZDogc3RyaW5nLCBjb21wb25lbnRUeXBlOiBzdHJpbmcpOiBQcm9taXNlPFRvb2xSZXNwb25zZT4ge1xuICAgICAgICAvLyDkvJjlhYjlsJ3or5Xnm7TmjqXkvb/nlKggRWRpdG9yIEFQSSDmn6Xor6LoioLngrnkv6Hmga9cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IG5vZGVEYXRhID0gYXdhaXQgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnc2NlbmUnLCAncXVlcnktbm9kZScsIG5vZGVVdWlkKTtcbiAgICAgICAgICAgIGlmIChub2RlRGF0YSAmJiBub2RlRGF0YS5fX2NvbXBzX18pIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjb21wb25lbnQgPSBub2RlRGF0YS5fX2NvbXBzX18uZmluZCgoY29tcDogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbXBUeXBlID0gY29tcC5fX3R5cGVfXyB8fCBjb21wLmNpZCB8fCBjb21wLnR5cGU7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjb21wVHlwZSA9PT0gY29tcG9uZW50VHlwZTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGlmIChjb21wb25lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZVV1aWQ6IG5vZGVVdWlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudFR5cGU6IGNvbXBvbmVudFR5cGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW5hYmxlZDogKGNvbXBvbmVudCBhcyBhbnkpLmVuYWJsZWQgIT09IHVuZGVmaW5lZCA/IChjb21wb25lbnQgYXMgYW55KS5lbmFibGVkIDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiB0aGlzLmV4dHJhY3RDb21wb25lbnRQcm9wZXJ0aWVzKGNvbXBvbmVudClcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBDb21wb25lbnQgJyR7Y29tcG9uZW50VHlwZX0nIG5vdCBmb3VuZCBvbiBub2RlYCB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnTm9kZSBub3QgZm91bmQgb3Igbm8gY29tcG9uZW50cyBkYXRhJyB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlcnI6IGFueSkge1xuICAgICAgICAgICAgLy8g5aSH55So5pa55qGI77ya5L2/55So5Zy65pmv6ISa5pysXG4gICAgICAgICAgICBjb25zdCBvcHRpb25zID0ge1xuICAgICAgICAgICAgICAgIG5hbWU6ICdjb2Nvcy1tY3Atc2VydmVyJyxcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdnZXROb2RlSW5mbycsXG4gICAgICAgICAgICAgICAgYXJnczogW25vZGVVdWlkXVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdzY2VuZScsICdleGVjdXRlLXNjZW5lLXNjcmlwdCcsIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIGlmIChyZXN1bHQuc3VjY2VzcyAmJiByZXN1bHQuZGF0YS5jb21wb25lbnRzKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbXBvbmVudCA9IHJlc3VsdC5kYXRhLmNvbXBvbmVudHMuZmluZCgoY29tcDogYW55KSA9PiBjb21wLnR5cGUgPT09IGNvbXBvbmVudFR5cGUpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoY29tcG9uZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlVXVpZDogbm9kZVV1aWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudFR5cGU6IGNvbXBvbmVudFR5cGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLmNvbXBvbmVudFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGBDb21wb25lbnQgJyR7Y29tcG9uZW50VHlwZX0nIG5vdCBmb3VuZCBvbiBub2RlYCB9O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiByZXN1bHQuZXJyb3IgfHwgJ0ZhaWxlZCB0byBnZXQgY29tcG9uZW50IGluZm8nIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBjYXRjaCAoZXJyMjogYW55KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBgRGlyZWN0IEFQSSBmYWlsZWQ6ICR7ZXJyLm1lc3NhZ2V9LCBTY2VuZSBzY3JpcHQgZmFpbGVkOiAke2VycjIubWVzc2FnZX1gIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGV4dHJhY3RDb21wb25lbnRQcm9wZXJ0aWVzKGNvbXBvbmVudDogYW55KTogUmVjb3JkPHN0cmluZywgYW55PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbZXh0cmFjdENvbXBvbmVudFByb3BlcnRpZXNdIFByb2Nlc3NpbmcgY29tcG9uZW50OmAsIE9iamVjdC5rZXlzKGNvbXBvbmVudCkpO1xuICAgICAgICBcbiAgICAgICAgLy8g5qOA5p+l57uE5Lu25piv5ZCm5pyJIHZhbHVlIOWxnuaAp++8jOi/memAmuW4uOWMheWQq+WunumZheeahOe7hOS7tuWxnuaAp1xuICAgICAgICBpZiAoY29tcG9uZW50LnZhbHVlICYmIHR5cGVvZiBjb21wb25lbnQudmFsdWUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgW2V4dHJhY3RDb21wb25lbnRQcm9wZXJ0aWVzXSBGb3VuZCBjb21wb25lbnQudmFsdWUgd2l0aCBwcm9wZXJ0aWVzOmAsIE9iamVjdC5rZXlzKGNvbXBvbmVudC52YWx1ZSkpO1xuICAgICAgICAgICAgcmV0dXJuIGNvbXBvbmVudC52YWx1ZTsgLy8g55u05o6l6L+U5ZueIHZhbHVlIOWvueixoe+8jOWug+WMheWQq+aJgOaciee7hOS7tuWxnuaAp1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDlpIfnlKjmlrnmoYjvvJrku47nu4Tku7blr7nosaHkuK3nm7TmjqXmj5Dlj5blsZ7mgKdcbiAgICAgICAgY29uc3QgcHJvcGVydGllczogUmVjb3JkPHN0cmluZywgYW55PiA9IHt9O1xuICAgICAgICBjb25zdCBleGNsdWRlS2V5cyA9IFsnX190eXBlX18nLCAnZW5hYmxlZCcsICdub2RlJywgJ19pZCcsICdfX3NjcmlwdEFzc2V0JywgJ3V1aWQnLCAnbmFtZScsICdfbmFtZScsICdfb2JqRmxhZ3MnLCAnX2VuYWJsZWQnLCAndHlwZScsICdyZWFkb25seScsICd2aXNpYmxlJywgJ2NpZCcsICdlZGl0b3InLCAnZXh0ZW5kcyddO1xuICAgICAgICBcbiAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gY29tcG9uZW50KSB7XG4gICAgICAgICAgICBpZiAoIWV4Y2x1ZGVLZXlzLmluY2x1ZGVzKGtleSkgJiYgIWtleS5zdGFydHNXaXRoKCdfJykpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW2V4dHJhY3RDb21wb25lbnRQcm9wZXJ0aWVzXSBGb3VuZCBkaXJlY3QgcHJvcGVydHkgJyR7a2V5fSc6YCwgdHlwZW9mIGNvbXBvbmVudFtrZXldKTtcbiAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzW2tleV0gPSBjb21wb25lbnRba2V5XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgY29uc29sZS5sb2coYFtleHRyYWN0Q29tcG9uZW50UHJvcGVydGllc10gRmluYWwgZXh0cmFjdGVkIHByb3BlcnRpZXM6YCwgT2JqZWN0LmtleXMocHJvcGVydGllcykpO1xuICAgICAgICByZXR1cm4gcHJvcGVydGllcztcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIGZpbmRDb21wb25lbnRUeXBlQnlVdWlkKGNvbXBvbmVudFV1aWQ6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nIHwgbnVsbD4ge1xuICAgICAgICBjb25zb2xlLmxvZyhgW2ZpbmRDb21wb25lbnRUeXBlQnlVdWlkXSBTZWFyY2hpbmcgZm9yIGNvbXBvbmVudCB0eXBlIHdpdGggVVVJRDogJHtjb21wb25lbnRVdWlkfWApO1xuICAgICAgICBpZiAoIWNvbXBvbmVudFV1aWQpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBub2RlVHJlZSA9IGF3YWl0IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ3NjZW5lJywgJ3F1ZXJ5LW5vZGUtdHJlZScpO1xuICAgICAgICAgICAgaWYgKCFub2RlVHJlZSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignW2ZpbmRDb21wb25lbnRUeXBlQnlVdWlkXSBGYWlsZWQgdG8gcXVlcnkgbm9kZSB0cmVlLicpO1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBxdWV1ZTogYW55W10gPSBbbm9kZVRyZWVdO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB3aGlsZSAocXVldWUubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGN1cnJlbnROb2RlSW5mbyA9IHF1ZXVlLnNoaWZ0KCk7XG4gICAgICAgICAgICAgICAgaWYgKCFjdXJyZW50Tm9kZUluZm8gfHwgIWN1cnJlbnROb2RlSW5mby51dWlkKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGZ1bGxOb2RlRGF0YSA9IGF3YWl0IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ3NjZW5lJywgJ3F1ZXJ5LW5vZGUnLCBjdXJyZW50Tm9kZUluZm8udXVpZCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChmdWxsTm9kZURhdGEgJiYgZnVsbE5vZGVEYXRhLl9fY29tcHNfXykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBjb21wIG9mIGZ1bGxOb2RlRGF0YS5fX2NvbXBzX18pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjb21wQW55ID0gY29tcCBhcyBhbnk7IC8vIENhc3QgdG8gYW55IHRvIGFjY2VzcyBkeW5hbWljIHByb3BlcnRpZXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBUaGUgY29tcG9uZW50IFVVSUQgaXMgbmVzdGVkIGluIHRoZSAndmFsdWUnIHByb3BlcnR5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNvbXBBbnkudXVpZCAmJiBjb21wQW55LnV1aWQudmFsdWUgPT09IGNvbXBvbmVudFV1aWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY29tcG9uZW50VHlwZSA9IGNvbXBBbnkuX190eXBlX187XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbZmluZENvbXBvbmVudFR5cGVCeVV1aWRdIEZvdW5kIGNvbXBvbmVudCB0eXBlICcke2NvbXBvbmVudFR5cGV9JyBmb3IgVVVJRCAke2NvbXBvbmVudFV1aWR9IG9uIG5vZGUgJHtmdWxsTm9kZURhdGEubmFtZT8udmFsdWV9YCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjb21wb25lbnRUeXBlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBbZmluZENvbXBvbmVudFR5cGVCeVV1aWRdIENvdWxkIG5vdCBxdWVyeSBub2RlICR7Y3VycmVudE5vZGVJbmZvLnV1aWR9OmAsIGUpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChjdXJyZW50Tm9kZUluZm8uY2hpbGRyZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBjaGlsZCBvZiBjdXJyZW50Tm9kZUluZm8uY2hpbGRyZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXVlLnB1c2goY2hpbGQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYFtmaW5kQ29tcG9uZW50VHlwZUJ5VXVpZF0gQ29tcG9uZW50IHdpdGggVVVJRCAke2NvbXBvbmVudFV1aWR9IG5vdCBmb3VuZCBpbiBzY2VuZSB0cmVlLmApO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBbZmluZENvbXBvbmVudFR5cGVCeVV1aWRdIEVycm9yIHdoaWxlIHNlYXJjaGluZyBmb3IgY29tcG9uZW50IHR5cGU6YCwgZXJyb3IpO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIHNldENvbXBvbmVudFByb3BlcnRpZXMoYXJnczogYW55KTogUHJvbWlzZTxUb29sUmVzcG9uc2U+IHtcbiAgICAgICAgLy8g5qOA5p+l5piv5Y2V5Liq5bGe5oCn6K6+572u6L+Y5piv5om56YeP5bGe5oCn6K6+572uXG4gICAgICAgIGlmIChhcmdzLnByb3BlcnRpZXMpIHtcbiAgICAgICAgICAgIC8vIOaJuemHj+WxnuaAp+iuvue9rlxuICAgICAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc2V0TXVsdGlwbGVDb21wb25lbnRQcm9wZXJ0aWVzKGFyZ3MpO1xuICAgICAgICB9IGVsc2UgaWYgKGFyZ3MucHJvcGVydHkgJiYgYXJncy52YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAvLyDljZXkuKrlsZ7mgKforr7nva7vvJtwcm9wZXJ0eVR5cGUg57y655yB5pe26Ieq5Yqo5qOA5rWLXG4gICAgICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zZXRDb21wb25lbnRQcm9wZXJ0eShhcmdzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICAgICAgZXJyb3I6ICdJbnZhbGlkIHBhcmFtZXRlcnMuIFVzZSBlaXRoZXIgc2luZ2xlIHByb3BlcnR5IGZvcm1hdCAocHJvcGVydHksIHZhbHVlLCBvcHRpb25hbCBwcm9wZXJ0eVR5cGUpIG9yIGJhdGNoIGZvcm1hdCAocHJvcGVydGllcykuJ1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgc2V0TXVsdGlwbGVDb21wb25lbnRQcm9wZXJ0aWVzKGFyZ3M6IGFueSk6IFByb21pc2U8VG9vbFJlc3BvbnNlPiB7XG4gICAgICAgIGNvbnN0IHsgbm9kZVV1aWQsIGNvbXBvbmVudFR5cGUsIHByb3BlcnRpZXMgfSA9IGFyZ3M7XG4gICAgICAgIFxuICAgICAgICBpZiAoIXByb3BlcnRpZXMgfHwgdHlwZW9mIHByb3BlcnRpZXMgIT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGVycm9yOiAnUHJvcGVydGllcyBwYXJhbWV0ZXIgbXVzdCBiZSBhbiBvYmplY3Qgd2l0aCBwcm9wZXJ0eSBkZWZpbml0aW9ucydcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCByZXN1bHRzOiBhbnlbXSA9IFtdO1xuICAgICAgICBjb25zdCBlcnJvcnM6IHN0cmluZ1tdID0gW107XG4gICAgICAgIGxldCBzdWNjZXNzQ291bnQgPSAwO1xuICAgICAgICBjb25zdCBwcm9wZXJ0eU5hbWVzID0gT2JqZWN0LmtleXMocHJvcGVydGllcyk7XG5cbiAgICAgICAgZm9yIChjb25zdCBwcm9wZXJ0eU5hbWUgb2YgcHJvcGVydHlOYW1lcykge1xuICAgICAgICAgICAgY29uc3QgcHJvcGVydHlEZWYgPSBwcm9wZXJ0aWVzW3Byb3BlcnR5TmFtZV07XG4gICAgICAgICAgICBjb25zdCBpc0RlZmluaXRpb24gPSBwcm9wZXJ0eURlZiAhPT0gbnVsbCAmJiB0eXBlb2YgcHJvcGVydHlEZWYgPT09ICdvYmplY3QnICYmXG4gICAgICAgICAgICAgICAgIUFycmF5LmlzQXJyYXkocHJvcGVydHlEZWYpICYmIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChwcm9wZXJ0eURlZiwgJ3ZhbHVlJyk7XG4gICAgICAgICAgICBjb25zdCBwcm9wZXJ0eVZhbHVlID0gaXNEZWZpbml0aW9uID8gcHJvcGVydHlEZWYudmFsdWUgOiBwcm9wZXJ0eURlZjtcbiAgICAgICAgICAgIGNvbnN0IHByb3BlcnR5VHlwZSA9IGlzRGVmaW5pdGlvbiA/IHByb3BlcnR5RGVmLnR5cGUgOiB1bmRlZmluZWQ7XG5cbiAgICAgICAgICAgIGlmIChwcm9wZXJ0eVZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvciA9IGBQcm9wZXJ0eSAnJHtwcm9wZXJ0eU5hbWV9JyBtdXN0IGhhdmUgYSB2YWx1ZWA7XG4gICAgICAgICAgICAgICAgZXJyb3JzLnB1c2goZXJyb3IpO1xuICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnR5OiBwcm9wZXJ0eU5hbWUsXG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvclxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuc2V0Q29tcG9uZW50UHJvcGVydHkoe1xuICAgICAgICAgICAgICAgICAgICBub2RlVXVpZCxcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50VHlwZSwgIFxuICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eTogcHJvcGVydHlOYW1lLFxuICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eVR5cGUsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBwcm9wZXJ0eVZhbHVlXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eTogcHJvcGVydHlOYW1lLFxuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiByZXN1bHQuc3VjY2VzcyxcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogcmVzdWx0Lm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yOiByZXN1bHQuZXJyb3JcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGlmIChyZXN1bHQuc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzQ291bnQrKztcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBlcnJvcnMucHVzaChgJHtwcm9wZXJ0eU5hbWV9OiAke3Jlc3VsdC5lcnJvcn1gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGNhdGNoIChlcnI6IGFueSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTXNnID0gYCR7cHJvcGVydHlOYW1lfTogJHtlcnIubWVzc2FnZX1gO1xuICAgICAgICAgICAgICAgIGVycm9ycy5wdXNoKGVycm9yTXNnKTtcbiAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eTogcHJvcGVydHlOYW1lLFxuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGVycm9yTXNnXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB0b3RhbFJlcXVlc3RlZCA9IHByb3BlcnR5TmFtZXMubGVuZ3RoO1xuICAgICAgICBjb25zdCBpc0Z1bGxTdWNjZXNzID0gc3VjY2Vzc0NvdW50ID09PSB0b3RhbFJlcXVlc3RlZDtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc3VjY2VzczogaXNGdWxsU3VjY2VzcyxcbiAgICAgICAgICAgIG1lc3NhZ2U6IGlzRnVsbFN1Y2Nlc3MgXG4gICAgICAgICAgICAgICAgPyBgU3VjY2Vzc2Z1bGx5IHNldCBhbGwgJHtzdWNjZXNzQ291bnR9IHByb3BlcnRpZXNgXG4gICAgICAgICAgICAgICAgOiBgU2V0ICR7c3VjY2Vzc0NvdW50fSBvZiAke3RvdGFsUmVxdWVzdGVkfSBwcm9wZXJ0aWVzYCxcbiAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICBub2RlVXVpZCxcbiAgICAgICAgICAgICAgICBjb21wb25lbnRUeXBlLFxuICAgICAgICAgICAgICAgIHRvdGFsUmVxdWVzdGVkLFxuICAgICAgICAgICAgICAgIHRvdGFsU2V0OiBzdWNjZXNzQ291bnQsXG4gICAgICAgICAgICAgICAgcmVzdWx0cyxcbiAgICAgICAgICAgICAgICBlcnJvcnM6IGVycm9ycy5sZW5ndGggPiAwID8gZXJyb3JzIDogdW5kZWZpbmVkXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBzZXRDb21wb25lbnRQcm9wZXJ0eShhcmdzOiBhbnkpOiBQcm9taXNlPFRvb2xSZXNwb25zZT4ge1xuICAgICAgICBjb25zdCB7IG5vZGVVdWlkLCBjb21wb25lbnRUeXBlLCBwcm9wZXJ0eSwgcHJvcGVydHlUeXBlLCB2YWx1ZSB9ID0gYXJncztcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYFtDb21wb25lbnRUb29sc10gU2V0dGluZyAke2NvbXBvbmVudFR5cGV9LiR7cHJvcGVydHl9ICh0eXBlOiAke3Byb3BlcnR5VHlwZX0pID0gJHtKU09OLnN0cmluZ2lmeSh2YWx1ZSl9IG9uIG5vZGUgJHtub2RlVXVpZH1gKTtcblxuICAgICAgICAgICAgLy8gU3RlcCAwOiDmo4DmtYvmmK/lkKbkuLroioLngrnlsZ7mgKfvvIzlpoLmnpzmmK/liJnph43lrprlkJHliLDlr7nlupTnmoToioLngrnmlrnms5VcbiAgICAgICAgICAgIGNvbnN0IG5vZGVSZWRpcmVjdFJlc3VsdCA9IGF3YWl0IHRoaXMuY2hlY2tBbmRSZWRpcmVjdE5vZGVQcm9wZXJ0aWVzKGFyZ3MpO1xuICAgICAgICAgICAgaWYgKG5vZGVSZWRpcmVjdFJlc3VsdCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBub2RlUmVkaXJlY3RSZXN1bHQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFN0ZXAgMTog6I635Y+W57uE5Lu25L+h5oGv77yM5L2/55So5LiOZ2V0Q29tcG9uZW50c+ebuOWQjOeahOaWueazlVxuICAgICAgICAgICAgY29uc3QgY29tcG9uZW50c1Jlc3BvbnNlID0gYXdhaXQgdGhpcy5nZXRDb21wb25lbnRzKG5vZGVVdWlkKTtcbiAgICAgICAgICAgIGlmICghY29tcG9uZW50c1Jlc3BvbnNlLnN1Y2Nlc3MgfHwgIWNvbXBvbmVudHNSZXNwb25zZS5kYXRhKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yOiBgRmFpbGVkIHRvIGdldCBjb21wb25lbnRzIGZvciBub2RlICcke25vZGVVdWlkfSc6ICR7Y29tcG9uZW50c1Jlc3BvbnNlLmVycm9yfWAsXG4gICAgICAgICAgICAgICAgICAgIGluc3RydWN0aW9uOiBgUGxlYXNlIHZlcmlmeSB0aGF0IG5vZGUgVVVJRCAnJHtub2RlVXVpZH0nIGlzIGNvcnJlY3QuIFVzZSBnZXRfYWxsX25vZGVzIG9yIGZpbmRfbm9kZV9ieV9uYW1lIHRvIGdldCB0aGUgY29ycmVjdCBub2RlIFVVSUQuYFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IGFsbENvbXBvbmVudHMgPSBjb21wb25lbnRzUmVzcG9uc2UuZGF0YS5jb21wb25lbnRzO1xuXG4gICAgICAgICAgICAvLyBTdGVwIDI6IOafpeaJvuebruagh+e7hOS7tlxuICAgICAgICAgICAgbGV0IHRhcmdldENvbXBvbmVudCA9IG51bGw7XG4gICAgICAgICAgICBjb25zdCBhdmFpbGFibGVUeXBlczogc3RyaW5nW10gPSBbXTtcblxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhbGxDb21wb25lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY29tcCA9IGFsbENvbXBvbmVudHNbaV07XG4gICAgICAgICAgICAgICAgYXZhaWxhYmxlVHlwZXMucHVzaChjb21wLnR5cGUpO1xuXG4gICAgICAgICAgICAgICAgaWYgKGNvbXAudHlwZSA9PT0gY29tcG9uZW50VHlwZSkge1xuICAgICAgICAgICAgICAgICAgICB0YXJnZXRDb21wb25lbnQgPSBjb21wO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghdGFyZ2V0Q29tcG9uZW50KSB7XG4gICAgICAgICAgICAgICAgLy8g5o+Q5L6b5pu06K+m57uG55qE6ZSZ6K+v5L+h5oGv5ZKM5bu66K6uXG4gICAgICAgICAgICAgICAgY29uc3QgaW5zdHJ1Y3Rpb24gPSB0aGlzLmdlbmVyYXRlQ29tcG9uZW50U3VnZ2VzdGlvbihjb21wb25lbnRUeXBlLCBhdmFpbGFibGVUeXBlcywgcHJvcGVydHkpO1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvcjogYENvbXBvbmVudCAnJHtjb21wb25lbnRUeXBlfScgbm90IGZvdW5kIG9uIG5vZGUuIEF2YWlsYWJsZSBjb21wb25lbnRzOiAke2F2YWlsYWJsZVR5cGVzLmpvaW4oJywgJyl9YCxcbiAgICAgICAgICAgICAgICAgICAgaW5zdHJ1Y3Rpb246IGluc3RydWN0aW9uXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gU3RlcCAzOiDoh6rliqjmo4DmtYvlkozovazmjaLlsZ7mgKflgLxcbiAgICAgICAgICAgIGxldCBwcm9wZXJ0eUluZm87XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbQ29tcG9uZW50VG9vbHNdIEFuYWx5emluZyBwcm9wZXJ0eTogJHtwcm9wZXJ0eX1gKTtcbiAgICAgICAgICAgICAgICBwcm9wZXJ0eUluZm8gPSB0aGlzLmFuYWx5emVQcm9wZXJ0eSh0YXJnZXRDb21wb25lbnQsIHByb3BlcnR5KTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGFuYWx5emVFcnJvcjogYW55KSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgW0NvbXBvbmVudFRvb2xzXSBFcnJvciBpbiBhbmFseXplUHJvcGVydHk6YCwgYW5hbHl6ZUVycm9yKTtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGBGYWlsZWQgdG8gYW5hbHl6ZSBwcm9wZXJ0eSAnJHtwcm9wZXJ0eX0nOiAke2FuYWx5emVFcnJvci5tZXNzYWdlfWBcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIXByb3BlcnR5SW5mby5leGlzdHMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGBQcm9wZXJ0eSAnJHtwcm9wZXJ0eX0nIG5vdCBmb3VuZCBvbiBjb21wb25lbnQgJyR7Y29tcG9uZW50VHlwZX0nLiBBdmFpbGFibGUgcHJvcGVydGllczogJHtwcm9wZXJ0eUluZm8uYXZhaWxhYmxlUHJvcGVydGllcy5qb2luKCcsICcpfWBcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBTdGVwIDQ6IOWkhOeQhuWxnuaAp+WAvOWSjOiuvue9rlxuICAgICAgICAgICAgY29uc3Qgb3JpZ2luYWxWYWx1ZSA9IHByb3BlcnR5SW5mby5vcmlnaW5hbFZhbHVlO1xuICAgICAgICAgICAgbGV0IHByb2Nlc3NlZFZhbHVlOiBhbnk7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBmaW5hbFByb3BlcnR5VHlwZSA9ICFwcm9wZXJ0eVR5cGUgfHwgcHJvcGVydHlUeXBlID09PSAnYXV0bydcbiAgICAgICAgICAgICAgICAgICAgPyB0aGlzLmF1dG9EZXRlY3RQcm9wZXJ0eVR5cGUocHJvcGVydHksIHZhbHVlLCBvcmlnaW5hbFZhbHVlLCBwcm9wZXJ0eUluZm8udHlwZSwgcHJvcGVydHlJbmZvLm1ldGFkYXRhKVxuICAgICAgICAgICAgICAgICAgICA6IHByb3BlcnR5VHlwZTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvLyDmoLnmja7mmI7noa7nmoRwcm9wZXJ0eVR5cGXlpITnkIblsZ7mgKflgLxcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKGZpbmFsUHJvcGVydHlUeXBlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ3N0cmluZyc6XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9jZXNzZWRWYWx1ZSA9IFN0cmluZyh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnbnVtYmVyJzpcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnaW50ZWdlcic6XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2Zsb2F0JzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb2Nlc3NlZFZhbHVlID0gTnVtYmVyKHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdib29sZWFuJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb2Nlc3NlZFZhbHVlID0gQm9vbGVhbih2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnY29sb3InOlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyDlrZfnrKbkuLLmoLzlvI/vvJrmlK/mjIHljYHlha3ov5vliLbjgIHpopzoibLlkI3np7DjgIFyZ2IoKS9yZ2JhKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9jZXNzZWRWYWx1ZSA9IHRoaXMucGFyc2VDb2xvclN0cmluZyh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyDlr7nosaHmoLzlvI/vvJrpqozor4HlubbovazmjaJSR0JB5YC8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvY2Vzc2VkVmFsdWUgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHI6IE1hdGgubWluKDI1NSwgTWF0aC5tYXgoMCwgTnVtYmVyKHZhbHVlLnIpIHx8IDApKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZzogTWF0aC5taW4oMjU1LCBNYXRoLm1heCgwLCBOdW1iZXIodmFsdWUuZykgfHwgMCkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiOiBNYXRoLm1pbigyNTUsIE1hdGgubWF4KDAsIE51bWJlcih2YWx1ZS5iKSB8fCAwKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGE6IHZhbHVlLmEgIT09IHVuZGVmaW5lZCA/IE1hdGgubWluKDI1NSwgTWF0aC5tYXgoMCwgTnVtYmVyKHZhbHVlLmEpKSkgOiAyNTVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYENvbG9yIHZhbHVlIG11c3QgYmUgYW4gb2JqZWN0IHdpdGggciwgZywgYiBwcm9wZXJ0aWVzIG9yIGEgaGV4YWRlY2ltYWwgc3RyaW5nLiBFeHBlY3RlZDoge1wiclwiOjI1NSxcImdcIjowLFwiYlwiOjAsXCJhXCI6MjU1fSBvciBcIiNGRjAwMDBcIiwgYnV0IHJlY2VpdmVkOiAke0pTT04uc3RyaW5naWZ5KHZhbHVlKX0gKCR7dHlwZW9mIHZhbHVlfSlgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlICd2ZWMyJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICE9PSBudWxsICYmICd4JyBpbiB2YWx1ZSAmJiAneScgaW4gdmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9jZXNzZWRWYWx1ZSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeDogTnVtYmVyKHZhbHVlLngpIHx8IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHk6IE51bWJlcih2YWx1ZS55KSB8fCAwXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBWZWMyIHZhbHVlIG11c3QgYmUgYW4gb2JqZWN0IHdpdGggeCwgeSBwcm9wZXJ0aWVzLiBFeHBlY3RlZDoge1wieFwiOjEwMCxcInlcIjo1MH0sIGJ1dCByZWNlaXZlZDogJHtKU09OLnN0cmluZ2lmeSh2YWx1ZSl9ICgke3R5cGVvZiB2YWx1ZX0pYCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAndmVjMyc6XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAhPT0gbnVsbCAmJiAneCcgaW4gdmFsdWUgJiYgJ3knIGluIHZhbHVlICYmICd6JyBpbiB2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2Nlc3NlZFZhbHVlID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4OiBOdW1iZXIodmFsdWUueCkgfHwgMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeTogTnVtYmVyKHZhbHVlLnkpIHx8IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHo6IE51bWJlcih2YWx1ZS56KSB8fCAwXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBWZWMzIHZhbHVlIG11c3QgYmUgYW4gb2JqZWN0IHdpdGggeCwgeSwgeiBwcm9wZXJ0aWVzLiBFeHBlY3RlZDoge1wieFwiOjEsXCJ5XCI6MixcInpcIjozfSwgYnV0IHJlY2VpdmVkOiAke0pTT04uc3RyaW5naWZ5KHZhbHVlKX0gKCR7dHlwZW9mIHZhbHVlfSlgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdzaXplJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCd3aWR0aCcgaW4gdmFsdWUgJiYgJ2hlaWdodCcgaW4gdmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvY2Vzc2VkVmFsdWUgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogTnVtYmVyKHZhbHVlLndpZHRoKSB8fCAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiBOdW1iZXIodmFsdWUuaGVpZ2h0KSB8fCAwXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBTaXplIHZhbHVlIG11c3QgYmUgYW4gb2JqZWN0IHdpdGggd2lkdGgsIGhlaWdodCBwcm9wZXJ0aWVzLiBFeHBlY3RlZDoge1wid2lkdGhcIjoxMDAsXCJoZWlnaHRcIjo1MH0sIGJ1dCByZWNlaXZlZDogJHtKU09OLnN0cmluZ2lmeSh2YWx1ZSl9YCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFNpemUgdmFsdWUgbXVzdCBiZSBhbiBvYmplY3Qgd2l0aCB3aWR0aCwgaGVpZ2h0IHByb3BlcnRpZXMuIEV4cGVjdGVkOiB7XCJ3aWR0aFwiOjEwMCxcImhlaWdodFwiOjUwfSwgYnV0IHJlY2VpdmVkOiAke0pTT04uc3RyaW5naWZ5KHZhbHVlKX0gKCR7dHlwZW9mIHZhbHVlfSlgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdub2RlJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvY2Vzc2VkVmFsdWUgPSB7IHV1aWQ6IHZhbHVlIH07XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTm9kZSByZWZlcmVuY2UgdmFsdWUgbXVzdCBiZSBhIHN0cmluZyBVVUlEJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnY29tcG9uZW50JzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8g57uE5Lu25byV55So6ZyA6KaB54m55q6K5aSE55CG77ya6YCa6L+H6IqC54K5VVVJROaJvuWIsOe7hOS7tueahF9faWRfX1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2Nlc3NlZFZhbHVlID0gdmFsdWU7IC8vIOWFiOS/neWtmOiKgueCuVVVSUTvvIzlkI7nu63kvJrovazmjaLkuLpfX2lkX19cbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDb21wb25lbnQgcmVmZXJlbmNlIHZhbHVlIG11c3QgYmUgYSBzdHJpbmcgKG5vZGUgVVVJRCBjb250YWluaW5nIHRoZSB0YXJnZXQgY29tcG9uZW50KScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ3Nwcml0ZUZyYW1lJzpcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAncHJlZmFiJzpcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnYXNzZXQnOlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9jZXNzZWRWYWx1ZSA9IHsgdXVpZDogdmFsdWUgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGAke2ZpbmFsUHJvcGVydHlUeXBlfSB2YWx1ZSBtdXN0IGJlIGEgc3RyaW5nIFVVSURgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdub2RlQXJyYXknOlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvY2Vzc2VkVmFsdWUgPSB2YWx1ZS5tYXAoKGl0ZW06IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGl0ZW0gPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4geyB1dWlkOiBpdGVtIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoaXRlbSAmJiB0eXBlb2YgaXRlbSA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIGl0ZW0udXVpZCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7IHV1aWQ6IGl0ZW0udXVpZCB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdOb2RlQXJyYXkgaXRlbXMgbXVzdCBiZSBVVUlEIHN0cmluZ3Mgb3Ige3V1aWR9IG9iamVjdHMnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vZGVBcnJheSB2YWx1ZSBtdXN0IGJlIGFuIGFycmF5Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnYXNzZXRBcnJheSc6XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9jZXNzZWRWYWx1ZSA9IHZhbHVlLm1hcCgoaXRlbTogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgaXRlbSA9PT0gJ3N0cmluZycpIHJldHVybiB7IHV1aWQ6IGl0ZW0gfTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGl0ZW0gJiYgdHlwZW9mIGl0ZW0gPT09ICdvYmplY3QnICYmIHR5cGVvZiBpdGVtLnV1aWQgPT09ICdzdHJpbmcnKSByZXR1cm4geyB1dWlkOiBpdGVtLnV1aWQgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBc3NldEFycmF5IGl0ZW1zIG11c3QgYmUgVVVJRCBzdHJpbmdzIG9yIHt1dWlkfSBvYmplY3RzJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQXNzZXRBcnJheSB2YWx1ZSBtdXN0IGJlIGFuIGFycmF5Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnY29sb3JBcnJheSc6XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9jZXNzZWRWYWx1ZSA9IHZhbHVlLm1hcCgoaXRlbTogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgaXRlbSA9PT0gJ29iamVjdCcgJiYgaXRlbSAhPT0gbnVsbCAmJiAncicgaW4gaXRlbSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByOiBNYXRoLm1pbigyNTUsIE1hdGgubWF4KDAsIE51bWJlcihpdGVtLnIpIHx8IDApKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBnOiBNYXRoLm1pbigyNTUsIE1hdGgubWF4KDAsIE51bWJlcihpdGVtLmcpIHx8IDApKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiOiBNYXRoLm1pbigyNTUsIE1hdGgubWF4KDAsIE51bWJlcihpdGVtLmIpIHx8IDApKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhOiBpdGVtLmEgIT09IHVuZGVmaW5lZCA/IE1hdGgubWluKDI1NSwgTWF0aC5tYXgoMCwgTnVtYmVyKGl0ZW0uYSkpKSA6IDI1NVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7IHI6IDI1NSwgZzogMjU1LCBiOiAyNTUsIGE6IDI1NSB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ29sb3JBcnJheSB2YWx1ZSBtdXN0IGJlIGFuIGFycmF5Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnbnVtYmVyQXJyYXknOlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvY2Vzc2VkVmFsdWUgPSB2YWx1ZS5tYXAoKGl0ZW06IGFueSkgPT4gTnVtYmVyKGl0ZW0pKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdOdW1iZXJBcnJheSB2YWx1ZSBtdXN0IGJlIGFuIGFycmF5Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnYm9vbGVhbkFycmF5JzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2Nlc3NlZFZhbHVlID0gdmFsdWUubWFwKChpdGVtOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBpdGVtID09PSAnc3RyaW5nJykgcmV0dXJuIGl0ZW0udG9Mb3dlckNhc2UoKSA9PT0gJ3RydWUnIHx8IGl0ZW0gPT09ICcxJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEJvb2xlYW4oaXRlbSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQm9vbGVhbkFycmF5IHZhbHVlIG11c3QgYmUgYW4gYXJyYXknKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdzdHJpbmdBcnJheSc6XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9jZXNzZWRWYWx1ZSA9IHZhbHVlLm1hcCgoaXRlbTogYW55KSA9PiBTdHJpbmcoaXRlbSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1N0cmluZ0FycmF5IHZhbHVlIG11c3QgYmUgYW4gYXJyYXknKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbnN1cHBvcnRlZCBwcm9wZXJ0eSB0eXBlOiAke2ZpbmFsUHJvcGVydHlUeXBlfWApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW0NvbXBvbmVudFRvb2xzXSBDb252ZXJ0aW5nIHZhbHVlOiAke0pTT04uc3RyaW5naWZ5KHZhbHVlKX0gLT4gJHtKU09OLnN0cmluZ2lmeShwcm9jZXNzZWRWYWx1ZSl9ICh0eXBlOiAke2ZpbmFsUHJvcGVydHlUeXBlfSlgKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW0NvbXBvbmVudFRvb2xzXSBQcm9wZXJ0eSBhbmFseXNpcyByZXN1bHQ6IHByb3BlcnR5SW5mby50eXBlPVwiJHtwcm9wZXJ0eUluZm8udHlwZX1cIiwgcHJvcGVydHlUeXBlPVwiJHtmaW5hbFByb3BlcnR5VHlwZX1cImApO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbQ29tcG9uZW50VG9vbHNdIFdpbGwgdXNlIGNvbG9yIHNwZWNpYWwgaGFuZGxpbmc6ICR7ZmluYWxQcm9wZXJ0eVR5cGUgPT09ICdjb2xvcicgJiYgcHJvY2Vzc2VkVmFsdWUgJiYgdHlwZW9mIHByb2Nlc3NlZFZhbHVlID09PSAnb2JqZWN0J31gKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvLyDnlKjkuo7pqozor4HnmoTlrp7pmYXmnJ/mnJvlgLzvvIjlr7nkuo7nu4Tku7blvJXnlKjpnIDopoHnibnmrorlpITnkIbvvIlcbiAgICAgICAgICAgICAgICBsZXQgYWN0dWFsRXhwZWN0ZWRWYWx1ZSA9IHByb2Nlc3NlZFZhbHVlO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vIFN0ZXAgNTog6I635Y+W5Y6f5aeL6IqC54K55pWw5o2u5p2l5p6E5bu65q2j56Gu55qE6Lev5b6EXG4gICAgICAgICAgICAgICAgY29uc3QgcmF3Tm9kZURhdGEgPSBhd2FpdCBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdzY2VuZScsICdxdWVyeS1ub2RlJywgbm9kZVV1aWQpO1xuICAgICAgICAgICAgICAgIGlmICghcmF3Tm9kZURhdGEgfHwgIXJhd05vZGVEYXRhLl9fY29tcHNfXykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjogYEZhaWxlZCB0byBnZXQgcmF3IG5vZGUgZGF0YSBmb3IgcHJvcGVydHkgc2V0dGluZ2BcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyDmib7liLDljp/lp4vnu4Tku7bnmoTntKLlvJVcbiAgICAgICAgICAgICAgICBsZXQgcmF3Q29tcG9uZW50SW5kZXggPSAtMTtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHJhd05vZGVEYXRhLl9fY29tcHNfXy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjb21wID0gcmF3Tm9kZURhdGEuX19jb21wc19fW2ldIGFzIGFueTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY29tcFR5cGUgPSBjb21wLl9fdHlwZV9fIHx8IGNvbXAuY2lkIHx8IGNvbXAudHlwZSB8fCAnVW5rbm93bic7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjb21wVHlwZSA9PT0gY29tcG9uZW50VHlwZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmF3Q29tcG9uZW50SW5kZXggPSBpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAocmF3Q29tcG9uZW50SW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOiBgQ291bGQgbm90IGZpbmQgY29tcG9uZW50IGluZGV4IGZvciBzZXR0aW5nIHByb3BlcnR5YFxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvLyDmnoTlu7rmraPnoa7nmoTlsZ7mgKfot6/lvoRcbiAgICAgICAgICAgICAgICBsZXQgcHJvcGVydHlQYXRoID0gYF9fY29tcHNfXy4ke3Jhd0NvbXBvbmVudEluZGV4fS4ke3Byb3BlcnR5fWA7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy8g54m55q6K5aSE55CG6LWE5rqQ57G75bGe5oCnXG4gICAgICAgICAgICAgICAgaWYgKGZpbmFsUHJvcGVydHlUeXBlID09PSAnYXNzZXQnIHx8IGZpbmFsUHJvcGVydHlUeXBlID09PSAnc3ByaXRlRnJhbWUnIHx8IGZpbmFsUHJvcGVydHlUeXBlID09PSAncHJlZmFiJyB8fCBcbiAgICAgICAgICAgICAgICAgICAgKHByb3BlcnR5SW5mby50eXBlID09PSAnYXNzZXQnICYmIGZpbmFsUHJvcGVydHlUeXBlID09PSAnc3RyaW5nJykpIHtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbQ29tcG9uZW50VG9vbHNdIFNldHRpbmcgYXNzZXQgcmVmZXJlbmNlOmAsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBwcm9jZXNzZWRWYWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnR5OiBwcm9wZXJ0eSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnR5VHlwZTogZmluYWxQcm9wZXJ0eVR5cGUsXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXRoOiBwcm9wZXJ0eVBhdGhcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAvLyBEZXRlcm1pbmUgYXNzZXQgdHlwZSBiYXNlZCBvbiBwcm9wZXJ0eSBuYW1lXG4gICAgICAgICAgICAgICAgICAgIGxldCBhc3NldFR5cGUgPSAnY2MuU3ByaXRlRnJhbWUnOyAvLyBkZWZhdWx0XG4gICAgICAgICAgICAgICAgICAgIGlmIChwcm9wZXJ0eS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKCd0ZXh0dXJlJykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFzc2V0VHlwZSA9ICdjYy5UZXh0dXJlMkQnO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHByb3BlcnR5LnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoJ21hdGVyaWFsJykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFzc2V0VHlwZSA9ICdjYy5NYXRlcmlhbCc7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocHJvcGVydHkudG9Mb3dlckNhc2UoKS5pbmNsdWRlcygnZm9udCcpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhc3NldFR5cGUgPSAnY2MuRm9udCc7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocHJvcGVydHkudG9Mb3dlckNhc2UoKS5pbmNsdWRlcygnY2xpcCcpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhc3NldFR5cGUgPSAnY2MuQXVkaW9DbGlwJztcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChmaW5hbFByb3BlcnR5VHlwZSA9PT0gJ3ByZWZhYicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFzc2V0VHlwZSA9ICdjYy5QcmVmYWInO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBhd2FpdCBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdzY2VuZScsICdzZXQtcHJvcGVydHknLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB1dWlkOiBub2RlVXVpZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhdGg6IHByb3BlcnR5UGF0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGR1bXA6IHsgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHByb2Nlc3NlZFZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IGFzc2V0VHlwZVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGNvbXBvbmVudFR5cGUgPT09ICdjYy5VSVRyYW5zZm9ybScgJiYgKHByb3BlcnR5ID09PSAnX2NvbnRlbnRTaXplJyB8fCBwcm9wZXJ0eSA9PT0gJ2NvbnRlbnRTaXplJykpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gU3BlY2lhbCBoYW5kbGluZyBmb3IgVUlUcmFuc2Zvcm0gY29udGVudFNpemUgLSBzZXQgd2lkdGggYW5kIGhlaWdodCBzZXBhcmF0ZWx5XG4gICAgICAgICAgICAgICAgICAgIC8vIEZJWEVEOiBVc2UgcHJvcGVyIG51bGwgY2hlY2tpbmcgaW5zdGVhZCBvZiB8fCB3aGljaCB0cmVhdHMgMCBhcyBmYWxzeVxuICAgICAgICAgICAgICAgICAgICBjb25zdCB3aWR0aCA9IHZhbHVlLndpZHRoICE9PSB1bmRlZmluZWQgPyBOdW1iZXIodmFsdWUud2lkdGgpIDogMTAwO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBoZWlnaHQgPSB2YWx1ZS5oZWlnaHQgIT09IHVuZGVmaW5lZCA/IE51bWJlcih2YWx1ZS5oZWlnaHQpIDogMTAwO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLy8gU2V0IHdpZHRoIGZpcnN0XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ3NjZW5lJywgJ3NldC1wcm9wZXJ0eScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHV1aWQ6IG5vZGVVdWlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGF0aDogYF9fY29tcHNfXy4ke3Jhd0NvbXBvbmVudEluZGV4fS53aWR0aGAsXG4gICAgICAgICAgICAgICAgICAgICAgICBkdW1wOiB7IHZhbHVlOiB3aWR0aCB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLy8gVGhlbiBzZXQgaGVpZ2h0XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ3NjZW5lJywgJ3NldC1wcm9wZXJ0eScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHV1aWQ6IG5vZGVVdWlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGF0aDogYF9fY29tcHNfXy4ke3Jhd0NvbXBvbmVudEluZGV4fS5oZWlnaHRgLFxuICAgICAgICAgICAgICAgICAgICAgICAgZHVtcDogeyB2YWx1ZTogaGVpZ2h0IH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjb21wb25lbnRUeXBlID09PSAnY2MuVUlUcmFuc2Zvcm0nICYmIChwcm9wZXJ0eSA9PT0gJ19hbmNob3JQb2ludCcgfHwgcHJvcGVydHkgPT09ICdhbmNob3JQb2ludCcpKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFNwZWNpYWwgaGFuZGxpbmcgZm9yIFVJVHJhbnNmb3JtIGFuY2hvclBvaW50IC0gc2V0IGFuY2hvclggYW5kIGFuY2hvclkgc2VwYXJhdGVseVxuICAgICAgICAgICAgICAgICAgICAvLyBGSVhFRDogVXNlIHByb3BlciBudWxsIGNoZWNraW5nIGluc3RlYWQgb2YgfHwgd2hpY2ggdHJlYXRzIDAgYXMgZmFsc3lcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYW5jaG9yWCA9IHZhbHVlLnggIT09IHVuZGVmaW5lZCA/IE51bWJlcih2YWx1ZS54KSA6IDAuNTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYW5jaG9yWSA9IHZhbHVlLnkgIT09IHVuZGVmaW5lZCA/IE51bWJlcih2YWx1ZS55KSA6IDAuNTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8vIFNldCBhbmNob3JYIGZpcnN0XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ3NjZW5lJywgJ3NldC1wcm9wZXJ0eScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHV1aWQ6IG5vZGVVdWlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGF0aDogYF9fY29tcHNfXy4ke3Jhd0NvbXBvbmVudEluZGV4fS5hbmNob3JYYCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGR1bXA6IHsgdmFsdWU6IGFuY2hvclggfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8vIFRoZW4gc2V0IGFuY2hvclkgIFxuICAgICAgICAgICAgICAgICAgICBhd2FpdCBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdzY2VuZScsICdzZXQtcHJvcGVydHknLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB1dWlkOiBub2RlVXVpZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhdGg6IGBfX2NvbXBzX18uJHtyYXdDb21wb25lbnRJbmRleH0uYW5jaG9yWWAsXG4gICAgICAgICAgICAgICAgICAgICAgICBkdW1wOiB7IHZhbHVlOiBhbmNob3JZIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChmaW5hbFByb3BlcnR5VHlwZSA9PT0gJ2NvbG9yJyAmJiBwcm9jZXNzZWRWYWx1ZSAmJiB0eXBlb2YgcHJvY2Vzc2VkVmFsdWUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIOeJueauiuWkhOeQhuminOiJsuWxnuaAp++8jOehruS/nVJHQkHlgLzmraPnoa5cbiAgICAgICAgICAgICAgICAgICAgLy8gQ29jb3MgQ3JlYXRvcuminOiJsuWAvOiMg+WbtOaYrzAtMjU1XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbG9yVmFsdWUgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByOiBNYXRoLm1pbigyNTUsIE1hdGgubWF4KDAsIE51bWJlcihwcm9jZXNzZWRWYWx1ZS5yKSB8fCAwKSksXG4gICAgICAgICAgICAgICAgICAgICAgICBnOiBNYXRoLm1pbigyNTUsIE1hdGgubWF4KDAsIE51bWJlcihwcm9jZXNzZWRWYWx1ZS5nKSB8fCAwKSksXG4gICAgICAgICAgICAgICAgICAgICAgICBiOiBNYXRoLm1pbigyNTUsIE1hdGgubWF4KDAsIE51bWJlcihwcm9jZXNzZWRWYWx1ZS5iKSB8fCAwKSksXG4gICAgICAgICAgICAgICAgICAgICAgICBhOiBwcm9jZXNzZWRWYWx1ZS5hICE9PSB1bmRlZmluZWQgPyBNYXRoLm1pbigyNTUsIE1hdGgubWF4KDAsIE51bWJlcihwcm9jZXNzZWRWYWx1ZS5hKSkpIDogMjU1XG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW0NvbXBvbmVudFRvb2xzXSBTZXR0aW5nIGNvbG9yIHZhbHVlOmAsIGNvbG9yVmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnc2NlbmUnLCAnc2V0LXByb3BlcnR5Jywge1xuICAgICAgICAgICAgICAgICAgICAgICAgdXVpZDogbm9kZVV1aWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXRoOiBwcm9wZXJ0eVBhdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICBkdW1wOiB7IFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBjb2xvclZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdjYy5Db2xvcidcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChmaW5hbFByb3BlcnR5VHlwZSA9PT0gJ3ZlYzMnICYmIHByb2Nlc3NlZFZhbHVlICYmIHR5cGVvZiBwcm9jZXNzZWRWYWx1ZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8g54m55q6K5aSE55CGVmVjM+WxnuaAp1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB2ZWMzVmFsdWUgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB4OiBOdW1iZXIocHJvY2Vzc2VkVmFsdWUueCkgfHwgMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHk6IE51bWJlcihwcm9jZXNzZWRWYWx1ZS55KSB8fCAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgejogTnVtYmVyKHByb2Nlc3NlZFZhbHVlLnopIHx8IDBcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ3NjZW5lJywgJ3NldC1wcm9wZXJ0eScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHV1aWQ6IG5vZGVVdWlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGF0aDogcHJvcGVydHlQYXRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgZHVtcDogeyBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogdmVjM1ZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdjYy5WZWMzJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGZpbmFsUHJvcGVydHlUeXBlID09PSAndmVjMicgJiYgcHJvY2Vzc2VkVmFsdWUgJiYgdHlwZW9mIHByb2Nlc3NlZFZhbHVlID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICAgICAgICAvLyDnibnmrorlpITnkIZWZWMy5bGe5oCnXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHZlYzJWYWx1ZSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHg6IE51bWJlcihwcm9jZXNzZWRWYWx1ZS54KSB8fCAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgeTogTnVtYmVyKHByb2Nlc3NlZFZhbHVlLnkpIHx8IDBcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ3NjZW5lJywgJ3NldC1wcm9wZXJ0eScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHV1aWQ6IG5vZGVVdWlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGF0aDogcHJvcGVydHlQYXRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgZHVtcDogeyBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogdmVjMlZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdjYy5WZWMyJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGZpbmFsUHJvcGVydHlUeXBlID09PSAnc2l6ZScgJiYgcHJvY2Vzc2VkVmFsdWUgJiYgdHlwZW9mIHByb2Nlc3NlZFZhbHVlID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICAgICAgICAvLyDnibnmrorlpITnkIZTaXpl5bGe5oCnXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHNpemVWYWx1ZSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoOiBOdW1iZXIocHJvY2Vzc2VkVmFsdWUud2lkdGgpIHx8IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IE51bWJlcihwcm9jZXNzZWRWYWx1ZS5oZWlnaHQpIHx8IDBcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ3NjZW5lJywgJ3NldC1wcm9wZXJ0eScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHV1aWQ6IG5vZGVVdWlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGF0aDogcHJvcGVydHlQYXRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgZHVtcDogeyBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogc2l6ZVZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdjYy5TaXplJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGZpbmFsUHJvcGVydHlUeXBlID09PSAnbm9kZScgJiYgcHJvY2Vzc2VkVmFsdWUgJiYgdHlwZW9mIHByb2Nlc3NlZFZhbHVlID09PSAnb2JqZWN0JyAmJiAndXVpZCcgaW4gcHJvY2Vzc2VkVmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8g54m55q6K5aSE55CG6IqC54K55byV55SoXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbQ29tcG9uZW50VG9vbHNdIFNldHRpbmcgbm9kZSByZWZlcmVuY2Ugd2l0aCBVVUlEOiAke3Byb2Nlc3NlZFZhbHVlLnV1aWR9YCk7XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ3NjZW5lJywgJ3NldC1wcm9wZXJ0eScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHV1aWQ6IG5vZGVVdWlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGF0aDogcHJvcGVydHlQYXRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgZHVtcDogeyBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogcHJvY2Vzc2VkVmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2NjLk5vZGUnXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZmluYWxQcm9wZXJ0eVR5cGUgPT09ICdjb21wb25lbnQnICYmIHR5cGVvZiBwcm9jZXNzZWRWYWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8g54m55q6K5aSE55CG57uE5Lu25byV55So77ya6YCa6L+H6IqC54K5VVVJROaJvuWIsOe7hOS7tueahF9faWRfX1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB0YXJnZXROb2RlVXVpZCA9IHByb2Nlc3NlZFZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW0NvbXBvbmVudFRvb2xzXSBTZXR0aW5nIGNvbXBvbmVudCByZWZlcmVuY2UgLSBmaW5kaW5nIGNvbXBvbmVudCBvbiBub2RlOiAke3RhcmdldE5vZGVVdWlkfWApO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLy8g5LuO5b2T5YmN57uE5Lu255qE5bGe5oCn5YWD5pWw5o2u5Lit6I635Y+W5pyf5pyb55qE57uE5Lu257G75Z6LXG4gICAgICAgICAgICAgICAgICAgIGxldCBleHBlY3RlZENvbXBvbmVudFR5cGUgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8vIOiOt+WPluW9k+WJjee7hOS7tueahOivpue7huS/oeaBr++8jOWMheaLrOWxnuaAp+WFg+aVsOaNrlxuICAgICAgICAgICAgICAgICAgICBjb25zdCBjdXJyZW50Q29tcG9uZW50SW5mbyA9IGF3YWl0IHRoaXMuZ2V0Q29tcG9uZW50SW5mbyhub2RlVXVpZCwgY29tcG9uZW50VHlwZSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjdXJyZW50Q29tcG9uZW50SW5mby5zdWNjZXNzICYmIGN1cnJlbnRDb21wb25lbnRJbmZvLmRhdGE/LnByb3BlcnRpZXM/Lltwcm9wZXJ0eV0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHByb3BlcnR5TWV0YSA9IGN1cnJlbnRDb21wb25lbnRJbmZvLmRhdGEucHJvcGVydGllc1twcm9wZXJ0eV07XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIOS7juWxnuaAp+WFg+aVsOaNruS4reaPkOWPlue7hOS7tuexu+Wei+S/oeaBr1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHByb3BlcnR5TWV0YSAmJiB0eXBlb2YgcHJvcGVydHlNZXRhID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIOajgOafpeaYr+WQpuaciXR5cGXlrZfmrrXmjIfnpLrnu4Tku7bnsbvlnotcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocHJvcGVydHlNZXRhLnR5cGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhwZWN0ZWRDb21wb25lbnRUeXBlID0gcHJvcGVydHlNZXRhLnR5cGU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChwcm9wZXJ0eU1ldGEuY3Rvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyDmnInkupvlsZ7mgKflj6/og73kvb/nlKhjdG9y5a2X5q61XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4cGVjdGVkQ29tcG9uZW50VHlwZSA9IHByb3BlcnR5TWV0YS5jdG9yO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocHJvcGVydHlNZXRhLmV4dGVuZHMgJiYgQXJyYXkuaXNBcnJheShwcm9wZXJ0eU1ldGEuZXh0ZW5kcykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8g5qOA5p+lZXh0ZW5kc+aVsOe7hO+8jOmAmuW4uOesrOS4gOS4quaYr+acgOWFt+S9k+eahOexu+Wei1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGV4dGVuZFR5cGUgb2YgcHJvcGVydHlNZXRhLmV4dGVuZHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChleHRlbmRUeXBlLnN0YXJ0c1dpdGgoJ2NjLicpICYmIGV4dGVuZFR5cGUgIT09ICdjYy5Db21wb25lbnQnICYmIGV4dGVuZFR5cGUgIT09ICdjYy5PYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhwZWN0ZWRDb21wb25lbnRUeXBlID0gZXh0ZW5kVHlwZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFleHBlY3RlZENvbXBvbmVudFR5cGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5hYmxlIHRvIGRldGVybWluZSByZXF1aXJlZCBjb21wb25lbnQgdHlwZSBmb3IgcHJvcGVydHkgJyR7cHJvcGVydHl9JyBvbiBjb21wb25lbnQgJyR7Y29tcG9uZW50VHlwZX0nLiBQcm9wZXJ0eSBtZXRhZGF0YSBtYXkgbm90IGNvbnRhaW4gdHlwZSBpbmZvcm1hdGlvbi5gKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFtDb21wb25lbnRUb29sc10gRGV0ZWN0ZWQgcmVxdWlyZWQgY29tcG9uZW50IHR5cGU6ICR7ZXhwZWN0ZWRDb21wb25lbnRUeXBlfSBmb3IgcHJvcGVydHk6ICR7cHJvcGVydHl9YCk7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8g6I635Y+W55uu5qCH6IqC54K555qE57uE5Lu25L+h5oGvXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0YXJnZXROb2RlRGF0YSA9IGF3YWl0IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ3NjZW5lJywgJ3F1ZXJ5LW5vZGUnLCB0YXJnZXROb2RlVXVpZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXRhcmdldE5vZGVEYXRhIHx8ICF0YXJnZXROb2RlRGF0YS5fX2NvbXBzX18pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFRhcmdldCBub2RlICR7dGFyZ2V0Tm9kZVV1aWR9IG5vdCBmb3VuZCBvciBoYXMgbm8gY29tcG9uZW50c2ApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyDmiZPljbDnm67moIfoioLngrnnmoTnu4Tku7bmpoLop4hcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbQ29tcG9uZW50VG9vbHNdIFRhcmdldCBub2RlICR7dGFyZ2V0Tm9kZVV1aWR9IGhhcyAke3RhcmdldE5vZGVEYXRhLl9fY29tcHNfXy5sZW5ndGh9IGNvbXBvbmVudHM6YCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXROb2RlRGF0YS5fX2NvbXBzX18uZm9yRWFjaCgoY29tcDogYW55LCBpbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2NlbmVJZCA9IGNvbXAudmFsdWUgJiYgY29tcC52YWx1ZS51dWlkICYmIGNvbXAudmFsdWUudXVpZC52YWx1ZSA/IGNvbXAudmFsdWUudXVpZC52YWx1ZSA6ICd1bmtub3duJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW0NvbXBvbmVudFRvb2xzXSBDb21wb25lbnQgJHtpbmRleH06ICR7Y29tcC50eXBlfSAoc2NlbmVfaWQ6ICR7c2NlbmVJZH0pYCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8g5p+l5om+5a+55bqU55qE57uE5Lu2XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgdGFyZ2V0Q29tcG9uZW50ID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBjb21wb25lbnRJZDogc3RyaW5nIHwgbnVsbCA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIOWcqOebruagh+iKgueCueeahF9jb21wb25lbnRz5pWw57uE5Lit5p+l5om+5oyH5a6a57G75Z6L55qE57uE5Lu2XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyDms6jmhI/vvJpfX2NvbXBzX1/lkoxfY29tcG9uZW50c+eahOe0ouW8leaYr+WvueW6lOeahFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFtDb21wb25lbnRUb29sc10gU2VhcmNoaW5nIGZvciBjb21wb25lbnQgdHlwZTogJHtleHBlY3RlZENvbXBvbmVudFR5cGV9YCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGFyZ2V0Tm9kZURhdGEuX19jb21wc19fLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY29tcCA9IHRhcmdldE5vZGVEYXRhLl9fY29tcHNfX1tpXSBhcyBhbnk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFtDb21wb25lbnRUb29sc10gQ2hlY2tpbmcgY29tcG9uZW50ICR7aX06IHR5cGU9JHtjb21wLnR5cGV9LCB0YXJnZXQ9JHtleHBlY3RlZENvbXBvbmVudFR5cGV9YCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNvbXAudHlwZSA9PT0gZXhwZWN0ZWRDb21wb25lbnRUeXBlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldENvbXBvbmVudCA9IGNvbXA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbQ29tcG9uZW50VG9vbHNdIEZvdW5kIG1hdGNoaW5nIGNvbXBvbmVudCBhdCBpbmRleCAke2l9OiAke2NvbXAudHlwZX1gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIOS7jue7hOS7tueahHZhbHVlLnV1aWQudmFsdWXkuK3ojrflj5bnu4Tku7blnKjlnLrmma/kuK3nmoRJRFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY29tcC52YWx1ZSAmJiBjb21wLnZhbHVlLnV1aWQgJiYgY29tcC52YWx1ZS51dWlkLnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRJZCA9IGNvbXAudmFsdWUudXVpZC52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbQ29tcG9uZW50VG9vbHNdIEdvdCBjb21wb25lbnRJZCBmcm9tIGNvbXAudmFsdWUudXVpZC52YWx1ZTogJHtjb21wb25lbnRJZH1gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbQ29tcG9uZW50VG9vbHNdIENvbXBvbmVudCBzdHJ1Y3R1cmU6YCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhc1ZhbHVlOiAhIWNvbXAudmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFzVXVpZDogISEoY29tcC52YWx1ZSAmJiBjb21wLnZhbHVlLnV1aWQpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhc1V1aWRWYWx1ZTogISEoY29tcC52YWx1ZSAmJiBjb21wLnZhbHVlLnV1aWQgJiYgY29tcC52YWx1ZS51dWlkLnZhbHVlKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1dWlkU3RydWN0dXJlOiBjb21wLnZhbHVlID8gY29tcC52YWx1ZS51dWlkIDogJ05vIHZhbHVlJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuYWJsZSB0byBleHRyYWN0IGNvbXBvbmVudCBJRCBmcm9tIGNvbXBvbmVudCBzdHJ1Y3R1cmVgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXRhcmdldENvbXBvbmVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIOWmguaenOayoeaJvuWIsO+8jOWIl+WHuuWPr+eUqOe7hOS7tuiuqeeUqOaIt+S6huino++8jOaYvuekuuWcuuaZr+S4reeahOecn+WunklEXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgYXZhaWxhYmxlQ29tcG9uZW50cyA9IHRhcmdldE5vZGVEYXRhLl9fY29tcHNfXy5tYXAoKGNvbXA6IGFueSwgaW5kZXg6IG51bWJlcikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgc2NlbmVJZCA9ICd1bmtub3duJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8g5LuO57uE5Lu255qEdmFsdWUudXVpZC52YWx1ZeiOt+WPluWcuuaZr0lEXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb21wLnZhbHVlICYmIGNvbXAudmFsdWUudXVpZCAmJiBjb21wLnZhbHVlLnV1aWQudmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjZW5lSWQgPSBjb21wLnZhbHVlLnV1aWQudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGAke2NvbXAudHlwZX0oc2NlbmVfaWQ6JHtzY2VuZUlkfSlgO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgQ29tcG9uZW50IHR5cGUgJyR7ZXhwZWN0ZWRDb21wb25lbnRUeXBlfScgbm90IGZvdW5kIG9uIG5vZGUgJHt0YXJnZXROb2RlVXVpZH0uIEF2YWlsYWJsZSBjb21wb25lbnRzOiAke2F2YWlsYWJsZUNvbXBvbmVudHMuam9pbignLCAnKX1gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFtDb21wb25lbnRUb29sc10gRm91bmQgY29tcG9uZW50ICR7ZXhwZWN0ZWRDb21wb25lbnRUeXBlfSB3aXRoIHNjZW5lIElEOiAke2NvbXBvbmVudElkfSBvbiBub2RlICR7dGFyZ2V0Tm9kZVV1aWR9YCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIOabtOaWsOacn+acm+WAvOS4uuWunumZheeahOe7hOS7tklE5a+56LGh5qC85byP77yM55So5LqO5ZCO57ut6aqM6K+BXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY29tcG9uZW50SWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3R1YWxFeHBlY3RlZFZhbHVlID0geyB1dWlkOiBjb21wb25lbnRJZCB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyDlsJ3or5Xkvb/nlKjkuI7oioLngrkv6LWE5rqQ5byV55So55u45ZCM55qE5qC85byP77yae3V1aWQ6IGNvbXBvbmVudElkfVxuICAgICAgICAgICAgICAgICAgICAgICAgLy8g5rWL6K+V55yL5piv5ZCm6IO95q2j56Gu6K6+572u57uE5Lu25byV55SoXG4gICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdzY2VuZScsICdzZXQtcHJvcGVydHknLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXVpZDogbm9kZVV1aWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0aDogcHJvcGVydHlQYXRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGR1bXA6IHsgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiB7IHV1aWQ6IGNvbXBvbmVudElkIH0sICAvLyDkvb/nlKjlr7nosaHmoLzlvI/vvIzlg4/oioLngrkv6LWE5rqQ5byV55So5LiA5qC3XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IGV4cGVjdGVkQ29tcG9uZW50VHlwZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGBbQ29tcG9uZW50VG9vbHNdIEVycm9yIHNldHRpbmcgY29tcG9uZW50IHJlZmVyZW5jZTpgLCBlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5pc1N1cHBvcnRlZEFycmF5VHlwZShmaW5hbFByb3BlcnR5VHlwZSkgJiYgQXJyYXkuaXNBcnJheShwcm9jZXNzZWRWYWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZWxlbWVudFR5cGUgPSB0aGlzLmdldEFycmF5RHVtcEVsZW1lbnRUeXBlKGZpbmFsUHJvcGVydHlUeXBlLCBwcm9wZXJ0eUluZm8ubWV0YWRhdGEpO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW0NvbXBvbmVudFRvb2xzXSBTZXR0aW5nICR7ZmluYWxQcm9wZXJ0eVR5cGV9IHdpdGggZWxlbWVudCB0eXBlICR7ZWxlbWVudFR5cGV9OmAsIHByb2Nlc3NlZFZhbHVlKTtcblxuICAgICAgICAgICAgICAgICAgICBhd2FpdCBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdzY2VuZScsICdzZXQtcHJvcGVydHknLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB1dWlkOiBub2RlVXVpZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhdGg6IHByb3BlcnR5UGF0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGR1bXA6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogcHJvY2Vzc2VkVmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogZWxlbWVudFR5cGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNBcnJheTogdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBOb3JtYWwgcHJvcGVydHkgc2V0dGluZyBmb3Igbm9uLWFzc2V0IHByb3BlcnRpZXNcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnc2NlbmUnLCAnc2V0LXByb3BlcnR5Jywge1xuICAgICAgICAgICAgICAgICAgICAgICAgdXVpZDogbm9kZVV1aWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXRoOiBwcm9wZXJ0eVBhdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICBkdW1wOiB7IHZhbHVlOiBwcm9jZXNzZWRWYWx1ZSB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvLyBTdGVwIDU6IOetieW+hUVkaXRvcuWujOaIkOabtOaWsO+8jOeEtuWQjumqjOivgeiuvue9rue7k+aenFxuICAgICAgICAgICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHIgPT4gc2V0VGltZW91dChyLCAyMDApKTsgLy8g562J5b6FMjAwbXPorqlFZGl0b3LlrozmiJDmm7TmlrBcblxuICAgICAgICAgICAgICAgIGNvbnN0IHZlcmlmaWNhdGlvbiA9IGF3YWl0IHRoaXMudmVyaWZ5UHJvcGVydHlDaGFuZ2Uobm9kZVV1aWQsIGNvbXBvbmVudFR5cGUsIHByb3BlcnR5LCBvcmlnaW5hbFZhbHVlLCBhY3R1YWxFeHBlY3RlZFZhbHVlKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGBTdWNjZXNzZnVsbHkgc2V0ICR7Y29tcG9uZW50VHlwZX0uJHtwcm9wZXJ0eX1gLFxuICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlVXVpZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudFR5cGUsXG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnR5VHlwZTogZmluYWxQcm9wZXJ0eVR5cGUsXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlQXV0b0RldGVjdGVkOiAhcHJvcGVydHlUeXBlIHx8IHByb3BlcnR5VHlwZSA9PT0gJ2F1dG8nLFxuICAgICAgICAgICAgICAgICAgICAgICAgYWN0dWFsVmFsdWU6IHZlcmlmaWNhdGlvbi5hY3R1YWxWYWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoYW5nZVZlcmlmaWVkOiB2ZXJpZmljYXRpb24udmVyaWZpZWRcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgW0NvbXBvbmVudFRvb2xzXSBFcnJvciBzZXR0aW5nIHByb3BlcnR5OmAsIGVycm9yKTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICAgICAgZXJyb3I6IGBGYWlsZWQgdG8gc2V0IHByb3BlcnR5OiAke2Vycm9yLm1lc3NhZ2V9YFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuXG4gICAgcHJpdmF0ZSBhc3luYyBnZXRBdmFpbGFibGVDb21wb25lbnRzKGNhdGVnb3J5OiBzdHJpbmcgPSAnYWxsJyk6IFByb21pc2U8VG9vbFJlc3BvbnNlPiB7XG4gICAgICAgIGNvbnN0IGNvbXBvbmVudENhdGVnb3JpZXM6IFJlY29yZDxzdHJpbmcsIHN0cmluZ1tdPiA9IHtcbiAgICAgICAgICAgIHJlbmRlcmVyOiBbJ2NjLlNwcml0ZScsICdjYy5MYWJlbCcsICdjYy5SaWNoVGV4dCcsICdjYy5NYXNrJywgJ2NjLkdyYXBoaWNzJ10sXG4gICAgICAgICAgICB1aTogWydjYy5CdXR0b24nLCAnY2MuVG9nZ2xlJywgJ2NjLlNsaWRlcicsICdjYy5TY3JvbGxWaWV3JywgJ2NjLkVkaXRCb3gnLCAnY2MuUHJvZ3Jlc3NCYXInXSxcbiAgICAgICAgICAgIHBoeXNpY3M6IFsnY2MuUmlnaWRCb2R5MkQnLCAnY2MuQm94Q29sbGlkZXIyRCcsICdjYy5DaXJjbGVDb2xsaWRlcjJEJywgJ2NjLlBvbHlnb25Db2xsaWRlcjJEJ10sXG4gICAgICAgICAgICBhbmltYXRpb246IFsnY2MuQW5pbWF0aW9uJywgJ2NjLkFuaW1hdGlvbkNsaXAnLCAnY2MuU2tlbGV0YWxBbmltYXRpb24nXSxcbiAgICAgICAgICAgIGF1ZGlvOiBbJ2NjLkF1ZGlvU291cmNlJ10sXG4gICAgICAgICAgICBsYXlvdXQ6IFsnY2MuTGF5b3V0JywgJ2NjLldpZGdldCcsICdjYy5QYWdlVmlldycsICdjYy5QYWdlVmlld0luZGljYXRvciddLFxuICAgICAgICAgICAgZWZmZWN0czogWydjYy5Nb3Rpb25TdHJlYWsnLCAnY2MuUGFydGljbGVTeXN0ZW0yRCddLFxuICAgICAgICAgICAgY2FtZXJhOiBbJ2NjLkNhbWVyYSddLFxuICAgICAgICAgICAgbGlnaHQ6IFsnY2MuTGlnaHQnLCAnY2MuRGlyZWN0aW9uYWxMaWdodCcsICdjYy5Qb2ludExpZ2h0JywgJ2NjLlNwb3RMaWdodCddXG4gICAgICAgIH07XG5cbiAgICAgICAgbGV0IGNvbXBvbmVudHM6IHN0cmluZ1tdID0gW107XG4gICAgICAgIFxuICAgICAgICBpZiAoY2F0ZWdvcnkgPT09ICdhbGwnKSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGNhdCBpbiBjb21wb25lbnRDYXRlZ29yaWVzKSB7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50cyA9IGNvbXBvbmVudHMuY29uY2F0KGNvbXBvbmVudENhdGVnb3JpZXNbY2F0XSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoY29tcG9uZW50Q2F0ZWdvcmllc1tjYXRlZ29yeV0pIHtcbiAgICAgICAgICAgIGNvbXBvbmVudHMgPSBjb21wb25lbnRDYXRlZ29yaWVzW2NhdGVnb3J5XTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgIGNhdGVnb3J5OiBjYXRlZ29yeSxcbiAgICAgICAgICAgICAgICBjb21wb25lbnRzOiBjb21wb25lbnRzXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpc1ZhbGlkUHJvcGVydHlEZXNjcmlwdG9yKHByb3BEYXRhOiBhbnkpOiBib29sZWFuIHtcbiAgICAgICAgLy8g5qOA5p+l5piv5ZCm5piv5pyJ5pWI55qE5bGe5oCn5o+P6L+w5a+56LGhXG4gICAgICAgIGlmICh0eXBlb2YgcHJvcERhdGEgIT09ICdvYmplY3QnIHx8IHByb3BEYXRhID09PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBrZXlzID0gT2JqZWN0LmtleXMocHJvcERhdGEpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDpgb/lhY3pgY3ljobnroDljZXnmoTmlbDlgLzlr7nosaHvvIjlpoIge3dpZHRoOiAyMDAsIGhlaWdodDogMTUwfe+8iVxuICAgICAgICAgICAgY29uc3QgaXNTaW1wbGVWYWx1ZU9iamVjdCA9IGtleXMuZXZlcnkoa2V5ID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IHByb3BEYXRhW2tleV07XG4gICAgICAgICAgICAgICAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicgfHwgdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyB8fCB0eXBlb2YgdmFsdWUgPT09ICdib29sZWFuJztcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAoaXNTaW1wbGVWYWx1ZU9iamVjdCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8g5qOA5p+l5piv5ZCm5YyF5ZCr5bGe5oCn5o+P6L+w56ym55qE54m55b6B5a2X5q6177yM5LiN5L2/55SoJ2luJ+aTjeS9nOesplxuICAgICAgICAgICAgY29uc3QgaGFzTmFtZSA9IGtleXMuaW5jbHVkZXMoJ25hbWUnKTtcbiAgICAgICAgICAgIGNvbnN0IGhhc1ZhbHVlID0ga2V5cy5pbmNsdWRlcygndmFsdWUnKTtcbiAgICAgICAgICAgIGNvbnN0IGhhc1R5cGUgPSBrZXlzLmluY2x1ZGVzKCd0eXBlJyk7XG4gICAgICAgICAgICBjb25zdCBoYXNEaXNwbGF5TmFtZSA9IGtleXMuaW5jbHVkZXMoJ2Rpc3BsYXlOYW1lJyk7XG4gICAgICAgICAgICBjb25zdCBoYXNSZWFkb25seSA9IGtleXMuaW5jbHVkZXMoJ3JlYWRvbmx5Jyk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIOW/hemhu+WMheWQq25hbWXmiJZ2YWx1ZeWtl+aute+8jOS4lOmAmuW4uOi/mOaciXR5cGXlrZfmrrVcbiAgICAgICAgICAgIGNvbnN0IGhhc1ZhbGlkU3RydWN0dXJlID0gKGhhc05hbWUgfHwgaGFzVmFsdWUpICYmIChoYXNUeXBlIHx8IGhhc0Rpc3BsYXlOYW1lIHx8IGhhc1JlYWRvbmx5KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8g6aKd5aSW5qOA5p+l77ya5aaC5p6c5pyJZGVmYXVsdOWtl+auteS4lOe7k+aehOWkjeadgu+8jOmBv+WFjea3seW6pumBjeWOhlxuICAgICAgICAgICAgaWYgKGtleXMuaW5jbHVkZXMoJ2RlZmF1bHQnKSAmJiBwcm9wRGF0YS5kZWZhdWx0ICYmIHR5cGVvZiBwcm9wRGF0YS5kZWZhdWx0ID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGRlZmF1bHRLZXlzID0gT2JqZWN0LmtleXMocHJvcERhdGEuZGVmYXVsdCk7XG4gICAgICAgICAgICAgICAgaWYgKGRlZmF1bHRLZXlzLmluY2x1ZGVzKCd2YWx1ZScpICYmIHR5cGVvZiBwcm9wRGF0YS5kZWZhdWx0LnZhbHVlID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICAgICAgICAvLyDov5nnp43mg4XlhrXkuIvvvIzmiJHku6zlj6rov5Tlm57pobblsYLlsZ7mgKfvvIzkuI3mt7HlhaXpgY3ljoZkZWZhdWx0LnZhbHVlXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBoYXNWYWxpZFN0cnVjdHVyZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHJldHVybiBoYXNWYWxpZFN0cnVjdHVyZTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgW2lzVmFsaWRQcm9wZXJ0eURlc2NyaXB0b3JdIEVycm9yIGNoZWNraW5nIHByb3BlcnR5IGRlc2NyaXB0b3I6YCwgZXJyb3IpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhbmFseXplUHJvcGVydHkoY29tcG9uZW50OiBhbnksIHByb3BlcnR5TmFtZTogc3RyaW5nKTogeyBleGlzdHM6IGJvb2xlYW47IHR5cGU6IHN0cmluZzsgYXZhaWxhYmxlUHJvcGVydGllczogc3RyaW5nW107IG9yaWdpbmFsVmFsdWU6IGFueTsgbWV0YWRhdGE/OiBhbnkgfSB7XG4gICAgICAgIC8vIOS7juWkjeadgueahOe7hOS7tue7k+aehOS4reaPkOWPluWPr+eUqOWxnuaAp1xuICAgICAgICBjb25zdCBhdmFpbGFibGVQcm9wZXJ0aWVzOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgICBsZXQgcHJvcGVydHlWYWx1ZTogYW55ID0gdW5kZWZpbmVkO1xuICAgICAgICBsZXQgcHJvcGVydHlFeGlzdHMgPSBmYWxzZTtcbiAgICAgICAgbGV0IHByb3BlcnR5TWV0YWRhdGE6IGFueSA9IHVuZGVmaW5lZDtcbiAgICAgICAgXG4gICAgICAgIC8vIOWwneivleWkmuenjeaWueW8j+afpeaJvuWxnuaAp++8mlxuICAgICAgICAvLyAxLiDnm7TmjqXlsZ7mgKforr/pl65cbiAgICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChjb21wb25lbnQsIHByb3BlcnR5TmFtZSkpIHtcbiAgICAgICAgICAgIHByb3BlcnR5VmFsdWUgPSBjb21wb25lbnRbcHJvcGVydHlOYW1lXTtcbiAgICAgICAgICAgIHByb3BlcnR5RXhpc3RzID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8gMi4g5LuO5bWM5aWX57uT5p6E5Lit5p+l5om+ICjlpoLku47mtYvor5XmlbDmja7nnIvliLDnmoTlpI3mnYLnu5PmnoQpXG4gICAgICAgIGlmICghcHJvcGVydHlFeGlzdHMgJiYgY29tcG9uZW50LnByb3BlcnRpZXMgJiYgdHlwZW9mIGNvbXBvbmVudC5wcm9wZXJ0aWVzID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgLy8g6aaW5YWI5qOA5p+lcHJvcGVydGllcy52YWx1ZeaYr+WQpuWtmOWcqO+8iOi/meaYr+aIkeS7rOWcqGdldENvbXBvbmVudHPkuK3nnIvliLDnmoTnu5PmnoTvvIlcbiAgICAgICAgICAgIGlmIChjb21wb25lbnQucHJvcGVydGllcy52YWx1ZSAmJiB0eXBlb2YgY29tcG9uZW50LnByb3BlcnRpZXMudmFsdWUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdmFsdWVPYmogPSBjb21wb25lbnQucHJvcGVydGllcy52YWx1ZTtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IFtrZXksIHByb3BEYXRhXSBvZiBPYmplY3QuZW50cmllcyh2YWx1ZU9iaikpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8g5qOA5p+lcHJvcERhdGHmmK/lkKbmmK/kuIDkuKrmnInmlYjnmoTlsZ7mgKfmj4/ov7Dlr7nosaFcbiAgICAgICAgICAgICAgICAgICAgLy8g56Gu5L+dcHJvcERhdGHmmK/lr7nosaHkuJTljIXlkKvpooTmnJ/nmoTlsZ7mgKfnu5PmnoRcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuaXNWYWxpZFByb3BlcnR5RGVzY3JpcHRvcihwcm9wRGF0YSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHByb3BJbmZvID0gcHJvcERhdGEgYXMgYW55O1xuICAgICAgICAgICAgICAgICAgICAgICAgYXZhaWxhYmxlUHJvcGVydGllcy5wdXNoKGtleSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoa2V5ID09PSBwcm9wZXJ0eU5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eU1ldGFkYXRhID0gcHJvcEluZm87XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8g5LyY5YWI5L2/55SodmFsdWXlsZ7mgKfvvIzlpoLmnpzmsqHmnInliJnkvb/nlKhwcm9wRGF0YeacrOi6q1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHByb3BLZXlzID0gT2JqZWN0LmtleXMocHJvcEluZm8pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eVZhbHVlID0gcHJvcEtleXMuaW5jbHVkZXMoJ3ZhbHVlJykgPyBwcm9wSW5mby52YWx1ZSA6IHByb3BJbmZvO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIOWmguaenOajgOafpeWksei0pe+8jOebtOaOpeS9v+eUqHByb3BJbmZvXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnR5VmFsdWUgPSBwcm9wSW5mbztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydHlFeGlzdHMgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyDlpIfnlKjmlrnmoYjvvJrnm7TmjqXku45wcm9wZXJ0aWVz5p+l5om+XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBba2V5LCBwcm9wRGF0YV0gb2YgT2JqZWN0LmVudHJpZXMoY29tcG9uZW50LnByb3BlcnRpZXMpKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmlzVmFsaWRQcm9wZXJ0eURlc2NyaXB0b3IocHJvcERhdGEpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwcm9wSW5mbyA9IHByb3BEYXRhIGFzIGFueTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGF2YWlsYWJsZVByb3BlcnRpZXMucHVzaChrZXkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGtleSA9PT0gcHJvcGVydHlOYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydHlNZXRhZGF0YSA9IHByb3BJbmZvO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIOS8mOWFiOS9v+eUqHZhbHVl5bGe5oCn77yM5aaC5p6c5rKh5pyJ5YiZ5L2/55SocHJvcERhdGHmnKzouqtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwcm9wS2V5cyA9IE9iamVjdC5rZXlzKHByb3BJbmZvKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydHlWYWx1ZSA9IHByb3BLZXlzLmluY2x1ZGVzKCd2YWx1ZScpID8gcHJvcEluZm8udmFsdWUgOiBwcm9wSW5mbztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyDlpoLmnpzmo4Dmn6XlpLHotKXvvIznm7TmjqXkvb/nlKhwcm9wSW5mb1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eVZhbHVlID0gcHJvcEluZm87XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnR5RXhpc3RzID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8gMy4g5LuO55u05o6l5bGe5oCn5Lit5o+Q5Y+W566A5Y2V5bGe5oCn5ZCNXG4gICAgICAgIGlmIChhdmFpbGFibGVQcm9wZXJ0aWVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgZm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmtleXMoY29tcG9uZW50KSkge1xuICAgICAgICAgICAgICAgIGlmICgha2V5LnN0YXJ0c1dpdGgoJ18nKSAmJiAhWydfX3R5cGVfXycsICdjaWQnLCAnbm9kZScsICd1dWlkJywgJ25hbWUnLCAnZW5hYmxlZCcsICd0eXBlJywgJ3JlYWRvbmx5JywgJ3Zpc2libGUnXS5pbmNsdWRlcyhrZXkpKSB7XG4gICAgICAgICAgICAgICAgICAgIGF2YWlsYWJsZVByb3BlcnRpZXMucHVzaChrZXkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYgKCFwcm9wZXJ0eUV4aXN0cykge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBleGlzdHM6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHR5cGU6ICd1bmtub3duJyxcbiAgICAgICAgICAgICAgICBhdmFpbGFibGVQcm9wZXJ0aWVzLFxuICAgICAgICAgICAgICAgIG9yaWdpbmFsVmFsdWU6IHVuZGVmaW5lZFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgbGV0IHR5cGUgPSAndW5rbm93bic7XG4gICAgICAgIFxuICAgICAgICAvLyDmmbrog73nsbvlnovmo4DmtYtcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkocHJvcGVydHlWYWx1ZSkpIHtcbiAgICAgICAgICAgIHR5cGUgPSB0aGlzLmRldGVjdEFycmF5UHJvcGVydHlUeXBlKHByb3BlcnR5TmFtZSwgcHJvcGVydHlWYWx1ZSwgcHJvcGVydHlNZXRhZGF0YSk7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHByb3BlcnR5VmFsdWUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAvLyBDaGVjayBpZiBwcm9wZXJ0eSBuYW1lIHN1Z2dlc3RzIGl0J3MgYW4gYXNzZXRcbiAgICAgICAgICAgIGlmIChbJ3Nwcml0ZUZyYW1lJywgJ3RleHR1cmUnLCAnbWF0ZXJpYWwnLCAnZm9udCcsICdjbGlwJywgJ3ByZWZhYiddLmluY2x1ZGVzKHByb3BlcnR5TmFtZS50b0xvd2VyQ2FzZSgpKSkge1xuICAgICAgICAgICAgICAgIHR5cGUgPSAnYXNzZXQnO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0eXBlID0gJ3N0cmluZyc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHByb3BlcnR5VmFsdWUgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICB0eXBlID0gJ251bWJlcic7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHByb3BlcnR5VmFsdWUgPT09ICdib29sZWFuJykge1xuICAgICAgICAgICAgdHlwZSA9ICdib29sZWFuJztcbiAgICAgICAgfSBlbHNlIGlmIChwcm9wZXJ0eVZhbHVlICYmIHR5cGVvZiBwcm9wZXJ0eVZhbHVlID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBjb25zdCBrZXlzID0gT2JqZWN0LmtleXMocHJvcGVydHlWYWx1ZSk7XG4gICAgICAgICAgICAgICAgaWYgKGtleXMuaW5jbHVkZXMoJ3InKSAmJiBrZXlzLmluY2x1ZGVzKCdnJykgJiYga2V5cy5pbmNsdWRlcygnYicpKSB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGUgPSAnY29sb3InO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoa2V5cy5pbmNsdWRlcygneCcpICYmIGtleXMuaW5jbHVkZXMoJ3knKSkge1xuICAgICAgICAgICAgICAgICAgICB0eXBlID0gcHJvcGVydHlWYWx1ZS56ICE9PSB1bmRlZmluZWQgPyAndmVjMycgOiAndmVjMic7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChrZXlzLmluY2x1ZGVzKCd3aWR0aCcpICYmIGtleXMuaW5jbHVkZXMoJ2hlaWdodCcpKSB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGUgPSAnc2l6ZSc7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChrZXlzLmluY2x1ZGVzKCd1dWlkJykgfHwga2V5cy5pbmNsdWRlcygnX191dWlkX18nKSkge1xuICAgICAgICAgICAgICAgICAgICAvLyDmo4Dmn6XmmK/lkKbmmK/oioLngrnlvJXnlKjvvIjpgJrov4flsZ7mgKflkI3miJZfX2lkX1/lsZ7mgKfliKTmlq3vvIlcbiAgICAgICAgICAgICAgICAgICAgaWYgKHByb3BlcnR5TmFtZS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKCdub2RlJykgfHwgXG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eU5hbWUudG9Mb3dlckNhc2UoKS5pbmNsdWRlcygndGFyZ2V0JykgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgIGtleXMuaW5jbHVkZXMoJ19faWRfXycpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlID0gJ25vZGUnO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZSA9ICdhc3NldCc7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGtleXMuaW5jbHVkZXMoJ19faWRfXycpKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIOiKgueCueW8leeUqOeJueW+gVxuICAgICAgICAgICAgICAgICAgICB0eXBlID0gJ25vZGUnO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGUgPSAnb2JqZWN0JztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgW2FuYWx5emVQcm9wZXJ0eV0gRXJyb3IgY2hlY2tpbmcgcHJvcGVydHkgdHlwZSBmb3I6ICR7SlNPTi5zdHJpbmdpZnkocHJvcGVydHlWYWx1ZSl9YCk7XG4gICAgICAgICAgICAgICAgdHlwZSA9ICdvYmplY3QnO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHByb3BlcnR5VmFsdWUgPT09IG51bGwgfHwgcHJvcGVydHlWYWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAvLyBGb3IgbnVsbC91bmRlZmluZWQgdmFsdWVzLCBjaGVjayBwcm9wZXJ0eSBuYW1lIHRvIGRldGVybWluZSB0eXBlXG4gICAgICAgICAgICBpZiAoWydzcHJpdGVGcmFtZScsICd0ZXh0dXJlJywgJ21hdGVyaWFsJywgJ2ZvbnQnLCAnY2xpcCcsICdwcmVmYWInXS5pbmNsdWRlcyhwcm9wZXJ0eU5hbWUudG9Mb3dlckNhc2UoKSkpIHtcbiAgICAgICAgICAgICAgICB0eXBlID0gJ2Fzc2V0JztcbiAgICAgICAgICAgIH0gZWxzZSBpZiAocHJvcGVydHlOYW1lLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoJ25vZGUnKSB8fCBcbiAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eU5hbWUudG9Mb3dlckNhc2UoKS5pbmNsdWRlcygndGFyZ2V0JykpIHtcbiAgICAgICAgICAgICAgICB0eXBlID0gJ25vZGUnO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChwcm9wZXJ0eU5hbWUudG9Mb3dlckNhc2UoKS5pbmNsdWRlcygnY29tcG9uZW50JykpIHtcbiAgICAgICAgICAgICAgICB0eXBlID0gJ2NvbXBvbmVudCc7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHR5cGUgPSAndW5rbm93bic7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBleGlzdHM6IHRydWUsXG4gICAgICAgICAgICB0eXBlLFxuICAgICAgICAgICAgYXZhaWxhYmxlUHJvcGVydGllcyxcbiAgICAgICAgICAgIG9yaWdpbmFsVmFsdWU6IHByb3BlcnR5VmFsdWUsXG4gICAgICAgICAgICBtZXRhZGF0YTogcHJvcGVydHlNZXRhZGF0YVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0QXJyYXlFbGVtZW50Q29jb3NUeXBlKG1ldGFkYXRhOiBhbnkpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuICAgICAgICBpZiAoIW1ldGFkYXRhIHx8IHR5cGVvZiBtZXRhZGF0YSAhPT0gJ29iamVjdCcpIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIGNvbnN0IGNhbmRpZGF0ZXMgPSBbbWV0YWRhdGEudHlwZSwgbWV0YWRhdGEuY3RvciwgbWV0YWRhdGEuZWxlbWVudFR5cGUsIG1ldGFkYXRhLml0ZW1UeXBlXTtcbiAgICAgICAgZm9yIChjb25zdCBjYW5kaWRhdGUgb2YgY2FuZGlkYXRlcykge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBjYW5kaWRhdGUgPT09ICdzdHJpbmcnICYmIGNhbmRpZGF0ZS5sZW5ndGggPiAwICYmIGNhbmRpZGF0ZSAhPT0gJ0FycmF5JykgcmV0dXJuIGNhbmRpZGF0ZTtcbiAgICAgICAgICAgIGlmIChjYW5kaWRhdGUgJiYgdHlwZW9mIGNhbmRpZGF0ZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBuZXN0ZWQgPSBjYW5kaWRhdGUudHlwZSB8fCBjYW5kaWRhdGUubmFtZSB8fCBjYW5kaWRhdGUuY3RvcjtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIG5lc3RlZCA9PT0gJ3N0cmluZycgJiYgbmVzdGVkLmxlbmd0aCA+IDApIHJldHVybiBuZXN0ZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBwcml2YXRlIGRldGVjdEFycmF5UHJvcGVydHlUeXBlKHByb3BlcnR5TmFtZTogc3RyaW5nLCB2YWx1ZTogYW55W10sIG1ldGFkYXRhPzogYW55KTogc3RyaW5nIHtcbiAgICAgICAgY29uc3QgY29jb3NUeXBlID0gKHRoaXMuZ2V0QXJyYXlFbGVtZW50Q29jb3NUeXBlKG1ldGFkYXRhKSB8fCAnJykudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgaWYgKGNvY29zVHlwZSA9PT0gJ2NjLm5vZGUnIHx8IGNvY29zVHlwZS5lbmRzV2l0aCgnLm5vZGUnKSkgcmV0dXJuICdub2RlQXJyYXknO1xuICAgICAgICBpZiAoY29jb3NUeXBlID09PSAnY2MuY29sb3InIHx8IGNvY29zVHlwZS5lbmRzV2l0aCgnLmNvbG9yJykpIHJldHVybiAnY29sb3JBcnJheSc7XG4gICAgICAgIGlmIChjb2Nvc1R5cGUgPT09ICdudW1iZXInIHx8IGNvY29zVHlwZSA9PT0gJ2NjLm51bWJlcicgfHwgY29jb3NUeXBlID09PSAnZmxvYXQnIHx8IGNvY29zVHlwZSA9PT0gJ2ludGVnZXInKSByZXR1cm4gJ251bWJlckFycmF5JztcbiAgICAgICAgaWYgKGNvY29zVHlwZSA9PT0gJ2Jvb2xlYW4nIHx8IGNvY29zVHlwZSA9PT0gJ2NjLmJvb2xlYW4nKSByZXR1cm4gJ2Jvb2xlYW5BcnJheSc7XG4gICAgICAgIGlmIChjb2Nvc1R5cGUgPT09ICdzdHJpbmcnIHx8IGNvY29zVHlwZSA9PT0gJ2NjLnN0cmluZycpIHJldHVybiAnc3RyaW5nQXJyYXknO1xuICAgICAgICBpZiAoY29jb3NUeXBlICYmIChjb2Nvc1R5cGUuc3RhcnRzV2l0aCgnY2MuJykgfHwgY29jb3NUeXBlLmluY2x1ZGVzKCdhc3NldCcpKSkgcmV0dXJuICdhc3NldEFycmF5JztcblxuICAgICAgICBjb25zdCBzYW1wbGUgPSB2YWx1ZS5maW5kKGl0ZW0gPT4gaXRlbSAhPT0gbnVsbCAmJiBpdGVtICE9PSB1bmRlZmluZWQpO1xuICAgICAgICBpZiAodHlwZW9mIHNhbXBsZSA9PT0gJ251bWJlcicpIHJldHVybiAnbnVtYmVyQXJyYXknO1xuICAgICAgICBpZiAodHlwZW9mIHNhbXBsZSA9PT0gJ2Jvb2xlYW4nKSByZXR1cm4gJ2Jvb2xlYW5BcnJheSc7XG4gICAgICAgIGlmIChzYW1wbGUgJiYgdHlwZW9mIHNhbXBsZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIGlmICgncicgaW4gc2FtcGxlICYmICdnJyBpbiBzYW1wbGUgJiYgJ2InIGluIHNhbXBsZSkgcmV0dXJuICdjb2xvckFycmF5JztcbiAgICAgICAgICAgIGlmICgndXVpZCcgaW4gc2FtcGxlIHx8ICdfX3V1aWRfXycgaW4gc2FtcGxlKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbmFtZSA9IHByb3BlcnR5TmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgICAgICAgIHJldHVybiBuYW1lLmluY2x1ZGVzKCdub2RlJykgfHwgbmFtZS5pbmNsdWRlcygndGFyZ2V0JykgPyAnbm9kZUFycmF5JyA6ICdhc3NldEFycmF5JztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IG5hbWUgPSBwcm9wZXJ0eU5hbWUudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgaWYgKG5hbWUuaW5jbHVkZXMoJ25vZGUnKSB8fCBuYW1lLmluY2x1ZGVzKCd0YXJnZXQnKSkgcmV0dXJuICdub2RlQXJyYXknO1xuICAgICAgICBpZiAobmFtZS5pbmNsdWRlcygnY29sb3InKSkgcmV0dXJuICdjb2xvckFycmF5JztcbiAgICAgICAgcmV0dXJuICdzdHJpbmdBcnJheSc7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpc1N1cHBvcnRlZEFycmF5VHlwZSh0eXBlOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIFsnbm9kZUFycmF5JywgJ2Fzc2V0QXJyYXknLCAnY29sb3JBcnJheScsICdudW1iZXJBcnJheScsICdib29sZWFuQXJyYXknLCAnc3RyaW5nQXJyYXknXS5pbmNsdWRlcyh0eXBlKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldEFycmF5RHVtcEVsZW1lbnRUeXBlKHR5cGU6IHN0cmluZywgbWV0YWRhdGE/OiBhbnkpOiBzdHJpbmcge1xuICAgICAgICBjb25zdCBtZXRhZGF0YVR5cGUgPSB0aGlzLmdldEFycmF5RWxlbWVudENvY29zVHlwZShtZXRhZGF0YSk7XG4gICAgICAgIGlmIChtZXRhZGF0YVR5cGUpIHJldHVybiBtZXRhZGF0YVR5cGU7XG4gICAgICAgIGNvbnN0IHR5cGVNYXA6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XG4gICAgICAgICAgICBub2RlQXJyYXk6ICdjYy5Ob2RlJyxcbiAgICAgICAgICAgIGFzc2V0QXJyYXk6ICdjYy5Bc3NldCcsXG4gICAgICAgICAgICBjb2xvckFycmF5OiAnY2MuQ29sb3InLFxuICAgICAgICAgICAgbnVtYmVyQXJyYXk6ICdOdW1iZXInLFxuICAgICAgICAgICAgYm9vbGVhbkFycmF5OiAnQm9vbGVhbicsXG4gICAgICAgICAgICBzdHJpbmdBcnJheTogJ1N0cmluZydcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIHR5cGVNYXBbdHlwZV0gfHwgJ1N0cmluZyc7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog6Ieq5Yqo5qOA5rWL5bGe5oCn57G75Z6LXG4gICAgICovXG4gICAgcHJpdmF0ZSBhdXRvRGV0ZWN0UHJvcGVydHlUeXBlKHByb3BlcnR5TmFtZTogc3RyaW5nLCB2YWx1ZTogYW55LCBvcmlnaW5hbFZhbHVlOiBhbnksIGRldGVjdGVkVHlwZTogc3RyaW5nLCBtZXRhZGF0YT86IGFueSk6IHN0cmluZyB7XG4gICAgICAgIC8vIOaVsOe7hOW/hemhu+S8mOWFiOajgOa1i++8m+WQpuWImSBub2Rlcy90YXJnZXRzIOetieWQjeensOS8muiiq+ivr+WIpOaIkOWNleS4quiKgueCueW8leeUqOOAglxuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgICAgICAgIGNvbnN0IG9yaWdpbmFsQXJyYXkgPSBBcnJheS5pc0FycmF5KG9yaWdpbmFsVmFsdWUpID8gb3JpZ2luYWxWYWx1ZSA6IFtdO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGV0ZWN0QXJyYXlQcm9wZXJ0eVR5cGUocHJvcGVydHlOYW1lLCB2YWx1ZS5sZW5ndGggPiAwID8gdmFsdWUgOiBvcmlnaW5hbEFycmF5LCBtZXRhZGF0YSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyAxLiDln7rkuo7lsZ7mgKflkI3np7DnmoTlkK/lj5HlvI/mo4DmtYtcbiAgICAgICAgY29uc3QgbmFtZUxvd2VyID0gcHJvcGVydHlOYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIFxuICAgICAgICAvLyDotYTmupDnsbvlnovmo4DmtYtcbiAgICAgICAgaWYgKG5hbWVMb3dlci5pbmNsdWRlcygncHJlZmFiJykpIHJldHVybiAncHJlZmFiJztcbiAgICAgICAgaWYgKG5hbWVMb3dlci5pbmNsdWRlcygnc3ByaXRlZnJhbWUnKSB8fCBuYW1lTG93ZXIuaW5jbHVkZXMoJ3Nwcml0ZV9mcmFtZScpKSByZXR1cm4gJ3Nwcml0ZUZyYW1lJztcbiAgICAgICAgaWYgKG5hbWVMb3dlci5pbmNsdWRlcygnbWF0ZXJpYWwnKSkgcmV0dXJuICdhc3NldCc7XG4gICAgICAgIGlmIChuYW1lTG93ZXIuaW5jbHVkZXMoJ3RleHR1cmUnKSB8fCBuYW1lTG93ZXIuaW5jbHVkZXMoJ2ZvbnQnKSB8fCBuYW1lTG93ZXIuaW5jbHVkZXMoJ2NsaXAnKSkgcmV0dXJuICdhc3NldCc7XG4gICAgICAgIFxuICAgICAgICAvLyDoioLngrnlvJXnlKjmo4DmtYtcbiAgICAgICAgaWYgKG5hbWVMb3dlci5pbmNsdWRlcygnbm9kZScpIHx8IG5hbWVMb3dlci5pbmNsdWRlcygndGFyZ2V0JykgfHwgbmFtZUxvd2VyLmluY2x1ZGVzKCdwbGF5ZXInKSB8fCBcbiAgICAgICAgICAgIG5hbWVMb3dlci5pbmNsdWRlcygnZW5lbXknKSB8fCBuYW1lTG93ZXIuaW5jbHVkZXMoJ2J1bGxldCcpIHx8IG5hbWVMb3dlci5pbmNsdWRlcygndWknKSB8fFxuICAgICAgICAgICAgbmFtZUxvd2VyLmluY2x1ZGVzKCdsYXllcicpIHx8IG5hbWVMb3dlci5pbmNsdWRlcygnY2FudmFzJykpIHJldHVybiAnbm9kZSc7XG4gICAgICAgIFxuICAgICAgICAvLyDnu4Tku7blvJXnlKjmo4DmtYtcbiAgICAgICAgaWYgKG5hbWVMb3dlci5pbmNsdWRlcygnY29tcG9uZW50JykpIHJldHVybiAnY29tcG9uZW50JztcbiAgICAgICAgXG4gICAgICAgIC8vIDIuIOWfuuS6juWAvOexu+Wei+eahOajgOa1i1xuICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgLy8gVVVJROagvOW8j+ajgOa1i1xuICAgICAgICAgICAgaWYgKC9eWzAtOWEtZl17OH0tWzAtOWEtZl17NH0tWzAtOWEtZl17NH0tWzAtOWEtZl17NH0tWzAtOWEtZl17MTJ9JC9pLnRlc3QodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgLy8g6ZW/VVVJROmAmuW4uOaYr+i1hOa6kOW8leeUqFxuICAgICAgICAgICAgICAgIHJldHVybiAnYXNzZXQnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8g5Y2B5YWt6L+b5Yi26aKc6Imy5qOA5rWLXG4gICAgICAgICAgICBpZiAoL14jWzAtOWEtZl17Nn0kL2kudGVzdCh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJ2NvbG9yJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiAnc3RyaW5nJztcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicpIHJldHVybiAnbnVtYmVyJztcbiAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ2Jvb2xlYW4nKSByZXR1cm4gJ2Jvb2xlYW4nO1xuICAgICAgICBcbiAgICAgICAgLy8g5a+56LGh57G75Z6L5qOA5rWLXG4gICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICE9PSBudWxsKSB7XG4gICAgICAgICAgICAvLyDpopzoibLlr7nosaHmo4DmtYtcbiAgICAgICAgICAgIGlmICgncicgaW4gdmFsdWUgJiYgJ2cnIGluIHZhbHVlICYmICdiJyBpbiB2YWx1ZSkgcmV0dXJuICdjb2xvcic7XG4gICAgICAgICAgICAvLyBWZWMy5qOA5rWLXG4gICAgICAgICAgICBpZiAoJ3gnIGluIHZhbHVlICYmICd5JyBpbiB2YWx1ZSAmJiAhKCd6JyBpbiB2YWx1ZSkpIHJldHVybiAndmVjMic7XG4gICAgICAgICAgICAvLyBWZWMz5qOA5rWLXG4gICAgICAgICAgICBpZiAoJ3gnIGluIHZhbHVlICYmICd5JyBpbiB2YWx1ZSAmJiAneicgaW4gdmFsdWUpIHJldHVybiAndmVjMyc7XG4gICAgICAgICAgICAvLyBTaXpl5qOA5rWLXG4gICAgICAgICAgICBpZiAoJ3dpZHRoJyBpbiB2YWx1ZSAmJiAnaGVpZ2h0JyBpbiB2YWx1ZSkgcmV0dXJuICdzaXplJztcbiAgICAgICAgICAgIC8vIFVVSUTlr7nosaHmo4DmtYvvvIjotYTmupDlvJXnlKjvvIlcbiAgICAgICAgICAgIGlmICgndXVpZCcgaW4gdmFsdWUpIHJldHVybiAnYXNzZXQnO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyAzLiDln7rkuo7ljp/lp4vlgLznmoTlm57pgIDmo4DmtYtcbiAgICAgICAgaWYgKG9yaWdpbmFsVmFsdWUgIT09IHVuZGVmaW5lZCAmJiBvcmlnaW5hbFZhbHVlICE9PSBudWxsKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIG9yaWdpbmFsVmFsdWUgPT09ICdvYmplY3QnICYmICdyJyBpbiBvcmlnaW5hbFZhbHVlKSByZXR1cm4gJ2NvbG9yJztcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygb3JpZ2luYWxWYWx1ZSA9PT0gJ29iamVjdCcgJiYgJ3gnIGluIG9yaWdpbmFsVmFsdWUgJiYgJ3knIGluIG9yaWdpbmFsVmFsdWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJ3onIGluIG9yaWdpbmFsVmFsdWUgPyAndmVjMycgOiAndmVjMic7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodHlwZW9mIG9yaWdpbmFsVmFsdWUgPT09ICdvYmplY3QnICYmICd3aWR0aCcgaW4gb3JpZ2luYWxWYWx1ZSkgcmV0dXJuICdzaXplJztcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8gNC4g5L2/55So5qOA5rWL5Yiw55qE57G75Z6L5L2c5Li65Zue6YCAXG4gICAgICAgIGlmIChkZXRlY3RlZFR5cGUgJiYgZGV0ZWN0ZWRUeXBlICE9PSAndW5rbm93bicpIHJldHVybiBkZXRlY3RlZFR5cGU7XG4gICAgICAgIFxuICAgICAgICAvLyA1LiDmnIDnu4jlm57pgIDliLDln7rmnKznsbvlnotcbiAgICAgICAgcmV0dXJuICdzdHJpbmcnO1xuICAgIH1cblxuICAgIHByaXZhdGUgc21hcnRDb252ZXJ0VmFsdWUoaW5wdXRWYWx1ZTogYW55LCBwcm9wZXJ0eUluZm86IGFueSk6IGFueSB7XG4gICAgICAgIGNvbnN0IHsgdHlwZSwgb3JpZ2luYWxWYWx1ZSB9ID0gcHJvcGVydHlJbmZvO1xuICAgICAgICBcbiAgICAgICAgY29uc29sZS5sb2coYFtzbWFydENvbnZlcnRWYWx1ZV0gQ29udmVydGluZyAke0pTT04uc3RyaW5naWZ5KGlucHV0VmFsdWUpfSB0byB0eXBlOiAke3R5cGV9YCk7XG4gICAgICAgIFxuICAgICAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ3N0cmluZyc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIFN0cmluZyhpbnB1dFZhbHVlKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGNhc2UgJ251bWJlcic6XG4gICAgICAgICAgICAgICAgcmV0dXJuIE51bWJlcihpbnB1dFZhbHVlKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGNhc2UgJ2Jvb2xlYW4nOlxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgaW5wdXRWYWx1ZSA9PT0gJ2Jvb2xlYW4nKSByZXR1cm4gaW5wdXRWYWx1ZTtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGlucHV0VmFsdWUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBpbnB1dFZhbHVlLnRvTG93ZXJDYXNlKCkgPT09ICd0cnVlJyB8fCBpbnB1dFZhbHVlID09PSAnMSc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBCb29sZWFuKGlucHV0VmFsdWUpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgY2FzZSAnY29sb3InOlxuICAgICAgICAgICAgICAgIC8vIOS8mOWMlueahOminOiJsuWkhOeQhu+8jOaUr+aMgeWkmuenjei+k+WFpeagvOW8j1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgaW5wdXRWYWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8g5a2X56ym5Liy5qC85byP77ya5Y2B5YWt6L+b5Yi244CB6aKc6Imy5ZCN56ew44CBcmdiKCkvcmdiYSgpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnBhcnNlQ29sb3JTdHJpbmcoaW5wdXRWYWx1ZSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgaW5wdXRWYWx1ZSA9PT0gJ29iamVjdCcgJiYgaW5wdXRWYWx1ZSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaW5wdXRLZXlzID0gT2JqZWN0LmtleXMoaW5wdXRWYWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyDlpoLmnpzovpPlhaXmmK/popzoibLlr7nosaHvvIzpqozor4HlubbovazmjaJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbnB1dEtleXMuaW5jbHVkZXMoJ3InKSB8fCBpbnB1dEtleXMuaW5jbHVkZXMoJ2cnKSB8fCBpbnB1dEtleXMuaW5jbHVkZXMoJ2InKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHI6IE1hdGgubWluKDI1NSwgTWF0aC5tYXgoMCwgTnVtYmVyKGlucHV0VmFsdWUucikgfHwgMCkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBnOiBNYXRoLm1pbigyNTUsIE1hdGgubWF4KDAsIE51bWJlcihpbnB1dFZhbHVlLmcpIHx8IDApKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYjogTWF0aC5taW4oMjU1LCBNYXRoLm1heCgwLCBOdW1iZXIoaW5wdXRWYWx1ZS5iKSB8fCAwKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGE6IGlucHV0VmFsdWUuYSAhPT0gdW5kZWZpbmVkID8gTWF0aC5taW4oMjU1LCBNYXRoLm1heCgwLCBOdW1iZXIoaW5wdXRWYWx1ZS5hKSkpIDogMjU1XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgW3NtYXJ0Q29udmVydFZhbHVlXSBJbnZhbGlkIGNvbG9yIG9iamVjdDogJHtKU09OLnN0cmluZ2lmeShpbnB1dFZhbHVlKX1gKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyDlpoLmnpzmnInljp/lgLzvvIzkv53mjIHljp/lgLznu5PmnoTlubbmm7TmlrDmj5DkvpvnmoTlgLxcbiAgICAgICAgICAgICAgICBpZiAob3JpZ2luYWxWYWx1ZSAmJiB0eXBlb2Ygb3JpZ2luYWxWYWx1ZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGlucHV0S2V5cyA9IHR5cGVvZiBpbnB1dFZhbHVlID09PSAnb2JqZWN0JyAmJiBpbnB1dFZhbHVlID8gT2JqZWN0LmtleXMoaW5wdXRWYWx1ZSkgOiBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcjogaW5wdXRLZXlzLmluY2x1ZGVzKCdyJykgPyBNYXRoLm1pbigyNTUsIE1hdGgubWF4KDAsIE51bWJlcihpbnB1dFZhbHVlLnIpKSkgOiAob3JpZ2luYWxWYWx1ZS5yIHx8IDI1NSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZzogaW5wdXRLZXlzLmluY2x1ZGVzKCdnJykgPyBNYXRoLm1pbigyNTUsIE1hdGgubWF4KDAsIE51bWJlcihpbnB1dFZhbHVlLmcpKSkgOiAob3JpZ2luYWxWYWx1ZS5nIHx8IDI1NSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYjogaW5wdXRLZXlzLmluY2x1ZGVzKCdiJykgPyBNYXRoLm1pbigyNTUsIE1hdGgubWF4KDAsIE51bWJlcihpbnB1dFZhbHVlLmIpKSkgOiAob3JpZ2luYWxWYWx1ZS5iIHx8IDI1NSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYTogaW5wdXRLZXlzLmluY2x1ZGVzKCdhJykgPyBNYXRoLm1pbigyNTUsIE1hdGgubWF4KDAsIE51bWJlcihpbnB1dFZhbHVlLmEpKSkgOiAob3JpZ2luYWxWYWx1ZS5hIHx8IDI1NSlcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYFtzbWFydENvbnZlcnRWYWx1ZV0gRXJyb3IgcHJvY2Vzc2luZyBjb2xvciB3aXRoIG9yaWdpbmFsIHZhbHVlOiAke2Vycm9yfWApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIOm7mOiupOi/lOWbnueZveiJslxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgW3NtYXJ0Q29udmVydFZhbHVlXSBVc2luZyBkZWZhdWx0IHdoaXRlIGNvbG9yIGZvciBpbnZhbGlkIGlucHV0OiAke0pTT04uc3RyaW5naWZ5KGlucHV0VmFsdWUpfWApO1xuICAgICAgICAgICAgICAgIHJldHVybiB7IHI6IDI1NSwgZzogMjU1LCBiOiAyNTUsIGE6IDI1NSB9O1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgY2FzZSAndmVjMic6XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBpbnB1dFZhbHVlID09PSAnb2JqZWN0JyAmJiBpbnB1dFZhbHVlICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB4OiBOdW1iZXIoaW5wdXRWYWx1ZS54KSB8fCBvcmlnaW5hbFZhbHVlLnggfHwgMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHk6IE51bWJlcihpbnB1dFZhbHVlLnkpIHx8IG9yaWdpbmFsVmFsdWUueSB8fCAwXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBvcmlnaW5hbFZhbHVlO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgY2FzZSAndmVjMyc6XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBpbnB1dFZhbHVlID09PSAnb2JqZWN0JyAmJiBpbnB1dFZhbHVlICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB4OiBOdW1iZXIoaW5wdXRWYWx1ZS54KSB8fCBvcmlnaW5hbFZhbHVlLnggfHwgMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHk6IE51bWJlcihpbnB1dFZhbHVlLnkpIHx8IG9yaWdpbmFsVmFsdWUueSB8fCAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgejogTnVtYmVyKGlucHV0VmFsdWUueikgfHwgb3JpZ2luYWxWYWx1ZS56IHx8IDBcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIG9yaWdpbmFsVmFsdWU7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBjYXNlICdzaXplJzpcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGlucHV0VmFsdWUgPT09ICdvYmplY3QnICYmIGlucHV0VmFsdWUgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoOiBOdW1iZXIoaW5wdXRWYWx1ZS53aWR0aCkgfHwgb3JpZ2luYWxWYWx1ZS53aWR0aCB8fCAxMDAsXG4gICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IE51bWJlcihpbnB1dFZhbHVlLmhlaWdodCkgfHwgb3JpZ2luYWxWYWx1ZS5oZWlnaHQgfHwgMTAwXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBvcmlnaW5hbFZhbHVlO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgY2FzZSAnbm9kZSc6XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBpbnB1dFZhbHVlID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgICAgICAvLyDoioLngrnlvJXnlKjpnIDopoHnibnmrorlpITnkIZcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGlucHV0VmFsdWU7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgaW5wdXRWYWx1ZSA9PT0gJ29iamVjdCcgJiYgaW5wdXRWYWx1ZSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAvLyDlpoLmnpzlt7Lnu4/mmK/lr7nosaHlvaLlvI/vvIzov5Tlm55VVUlE5oiW5a6M5pW05a+56LGhXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBpbnB1dFZhbHVlLnV1aWQgfHwgaW5wdXRWYWx1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIG9yaWdpbmFsVmFsdWU7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBjYXNlICdhc3NldCc6XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBpbnB1dFZhbHVlID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgICAgICAvLyDlpoLmnpzovpPlhaXmmK/lrZfnrKbkuLLot6/lvoTvvIzovazmjaLkuLphc3NldOWvueixoVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4geyB1dWlkOiBpbnB1dFZhbHVlIH07XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgaW5wdXRWYWx1ZSA9PT0gJ29iamVjdCcgJiYgaW5wdXRWYWx1ZSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaW5wdXRWYWx1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIG9yaWdpbmFsVmFsdWU7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIC8vIOWvueS6juacquefpeexu+Wei++8jOWwvemHj+S/neaMgeWOn+aciee7k+aehFxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgaW5wdXRWYWx1ZSA9PT0gdHlwZW9mIG9yaWdpbmFsVmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGlucHV0VmFsdWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBvcmlnaW5hbFZhbHVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgICAgIHByaXZhdGUgcGFyc2VDb2xvclN0cmluZyhjb2xvclN0cjogc3RyaW5nKTogeyByOiBudW1iZXI7IGc6IG51bWJlcjsgYjogbnVtYmVyOyBhOiBudW1iZXIgfSB7XG4gICAgICAgIGNvbnN0IHN0ciA9IGNvbG9yU3RyLnRyaW0oKTtcbiAgICAgICAgXG4gICAgICAgIC8vIOWPquaUr+aMgeWNgeWFrei/m+WItuagvOW8jyAjUlJHR0JCIOaIliAjUlJHR0JCQUFcbiAgICAgICAgaWYgKHN0ci5zdGFydHNXaXRoKCcjJykpIHtcbiAgICAgICAgICAgIGlmIChzdHIubGVuZ3RoID09PSA3KSB7IC8vICNSUkdHQkJcbiAgICAgICAgICAgICAgICBjb25zdCByID0gcGFyc2VJbnQoc3RyLnN1YnN0cmluZygxLCAzKSwgMTYpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGcgPSBwYXJzZUludChzdHIuc3Vic3RyaW5nKDMsIDUpLCAxNik7XG4gICAgICAgICAgICAgICAgY29uc3QgYiA9IHBhcnNlSW50KHN0ci5zdWJzdHJpbmcoNSwgNyksIDE2KTtcbiAgICAgICAgICAgICAgICByZXR1cm4geyByLCBnLCBiLCBhOiAyNTUgfTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoc3RyLmxlbmd0aCA9PT0gOSkgeyAvLyAjUlJHR0JCQUFcbiAgICAgICAgICAgICAgICBjb25zdCByID0gcGFyc2VJbnQoc3RyLnN1YnN0cmluZygxLCAzKSwgMTYpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGcgPSBwYXJzZUludChzdHIuc3Vic3RyaW5nKDMsIDUpLCAxNik7XG4gICAgICAgICAgICAgICAgY29uc3QgYiA9IHBhcnNlSW50KHN0ci5zdWJzdHJpbmcoNSwgNyksIDE2KTtcbiAgICAgICAgICAgICAgICBjb25zdCBhID0gcGFyc2VJbnQoc3RyLnN1YnN0cmluZyg3LCA5KSwgMTYpO1xuICAgICAgICAgICAgICAgIHJldHVybiB7IHIsIGcsIGIsIGEgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g5aaC5p6c5LiN5piv5pyJ5pWI55qE5Y2B5YWt6L+b5Yi25qC85byP77yM6L+U5Zue6ZSZ6K+v5o+Q56S6XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBjb2xvciBmb3JtYXQ6IFwiJHtjb2xvclN0cn1cIi4gT25seSBoZXhhZGVjaW1hbCBmb3JtYXQgaXMgc3VwcG9ydGVkIChlLmcuLCBcIiNGRjAwMDBcIiBvciBcIiNGRjAwMDBGRlwiKWApO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgdmVyaWZ5UHJvcGVydHlDaGFuZ2Uobm9kZVV1aWQ6IHN0cmluZywgY29tcG9uZW50VHlwZTogc3RyaW5nLCBwcm9wZXJ0eTogc3RyaW5nLCBvcmlnaW5hbFZhbHVlOiBhbnksIGV4cGVjdGVkVmFsdWU6IGFueSk6IFByb21pc2U8eyB2ZXJpZmllZDogYm9vbGVhbjsgYWN0dWFsVmFsdWU6IGFueTsgZnVsbERhdGE6IGFueSB9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbdmVyaWZ5UHJvcGVydHlDaGFuZ2VdIFN0YXJ0aW5nIHZlcmlmaWNhdGlvbiBmb3IgJHtjb21wb25lbnRUeXBlfS4ke3Byb3BlcnR5fWApO1xuICAgICAgICBjb25zb2xlLmxvZyhgW3ZlcmlmeVByb3BlcnR5Q2hhbmdlXSBFeHBlY3RlZCB2YWx1ZTpgLCBKU09OLnN0cmluZ2lmeShleHBlY3RlZFZhbHVlKSk7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbdmVyaWZ5UHJvcGVydHlDaGFuZ2VdIE9yaWdpbmFsIHZhbHVlOmAsIEpTT04uc3RyaW5naWZ5KG9yaWdpbmFsVmFsdWUpKTtcbiAgICAgICAgXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyDph43mlrDojrflj5bnu4Tku7bkv6Hmga/ov5vooYzpqozor4FcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbdmVyaWZ5UHJvcGVydHlDaGFuZ2VdIENhbGxpbmcgZ2V0Q29tcG9uZW50SW5mby4uLmApO1xuICAgICAgICAgICAgY29uc3QgY29tcG9uZW50SW5mbyA9IGF3YWl0IHRoaXMuZ2V0Q29tcG9uZW50SW5mbyhub2RlVXVpZCwgY29tcG9uZW50VHlwZSk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgW3ZlcmlmeVByb3BlcnR5Q2hhbmdlXSBnZXRDb21wb25lbnRJbmZvIHN1Y2Nlc3M6YCwgY29tcG9uZW50SW5mby5zdWNjZXNzKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY29uc3QgYWxsQ29tcG9uZW50cyA9IGF3YWl0IHRoaXMuZ2V0Q29tcG9uZW50cyhub2RlVXVpZCk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgW3ZlcmlmeVByb3BlcnR5Q2hhbmdlXSBnZXRDb21wb25lbnRzIHN1Y2Nlc3M6YCwgYWxsQ29tcG9uZW50cy5zdWNjZXNzKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKGNvbXBvbmVudEluZm8uc3VjY2VzcyAmJiBjb21wb25lbnRJbmZvLmRhdGEpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW3ZlcmlmeVByb3BlcnR5Q2hhbmdlXSBDb21wb25lbnQgZGF0YSBhdmFpbGFibGUsIGV4dHJhY3RpbmcgcHJvcGVydHkgJyR7cHJvcGVydHl9J2ApO1xuICAgICAgICAgICAgICAgIGNvbnN0IGFsbFByb3BlcnR5TmFtZXMgPSBPYmplY3Qua2V5cyhjb21wb25lbnRJbmZvLmRhdGEucHJvcGVydGllcyB8fCB7fSk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFt2ZXJpZnlQcm9wZXJ0eUNoYW5nZV0gQXZhaWxhYmxlIHByb3BlcnRpZXM6YCwgYWxsUHJvcGVydHlOYW1lcyk7XG4gICAgICAgICAgICAgICAgY29uc3QgcHJvcGVydHlEYXRhID0gY29tcG9uZW50SW5mby5kYXRhLnByb3BlcnRpZXM/Lltwcm9wZXJ0eV07XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFt2ZXJpZnlQcm9wZXJ0eUNoYW5nZV0gUmF3IHByb3BlcnR5IGRhdGEgZm9yICcke3Byb3BlcnR5fSc6YCwgSlNPTi5zdHJpbmdpZnkocHJvcGVydHlEYXRhKSk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy8g5LuO5bGe5oCn5pWw5o2u5Lit5o+Q5Y+W5a6e6ZmF5YC8XG4gICAgICAgICAgICAgICAgbGV0IGFjdHVhbFZhbHVlID0gcHJvcGVydHlEYXRhO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbdmVyaWZ5UHJvcGVydHlDaGFuZ2VdIEluaXRpYWwgYWN0dWFsVmFsdWU6YCwgSlNPTi5zdHJpbmdpZnkoYWN0dWFsVmFsdWUpKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiAocHJvcGVydHlEYXRhICYmIHR5cGVvZiBwcm9wZXJ0eURhdGEgPT09ICdvYmplY3QnICYmICd2YWx1ZScgaW4gcHJvcGVydHlEYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgIGFjdHVhbFZhbHVlID0gcHJvcGVydHlEYXRhLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW3ZlcmlmeVByb3BlcnR5Q2hhbmdlXSBFeHRyYWN0ZWQgYWN0dWFsVmFsdWUgZnJvbSAudmFsdWU6YCwgSlNPTi5zdHJpbmdpZnkoYWN0dWFsVmFsdWUpKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW3ZlcmlmeVByb3BlcnR5Q2hhbmdlXSBObyAudmFsdWUgcHJvcGVydHkgZm91bmQsIHVzaW5nIHJhdyBkYXRhYCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vIOS/ruWkjemqjOivgemAu+i+ke+8muajgOafpeWunumZheWAvOaYr+WQpuWMuemFjeacn+acm+WAvFxuICAgICAgICAgICAgICAgIGxldCB2ZXJpZmllZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgZXhwZWN0ZWRWYWx1ZSA9PT0gJ29iamVjdCcgJiYgZXhwZWN0ZWRWYWx1ZSAhPT0gbnVsbCAmJiAndXVpZCcgaW4gZXhwZWN0ZWRWYWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAvLyDlr7nkuo7lvJXnlKjnsbvlnovvvIjoioLngrkv57uE5Lu2L+i1hOa6kO+8ie+8jOavlOi+g1VVSURcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYWN0dWFsVXVpZCA9IGFjdHVhbFZhbHVlICYmIHR5cGVvZiBhY3R1YWxWYWx1ZSA9PT0gJ29iamVjdCcgJiYgJ3V1aWQnIGluIGFjdHVhbFZhbHVlID8gYWN0dWFsVmFsdWUudXVpZCA6ICcnO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBleHBlY3RlZFV1aWQgPSBleHBlY3RlZFZhbHVlLnV1aWQgfHwgJyc7XG4gICAgICAgICAgICAgICAgICAgIHZlcmlmaWVkID0gYWN0dWFsVXVpZCA9PT0gZXhwZWN0ZWRVdWlkICYmIGV4cGVjdGVkVXVpZCAhPT0gJyc7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW3ZlcmlmeVByb3BlcnR5Q2hhbmdlXSBSZWZlcmVuY2UgY29tcGFyaXNvbjpgKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYCAgLSBFeHBlY3RlZCBVVUlEOiBcIiR7ZXhwZWN0ZWRVdWlkfVwiYCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGAgIC0gQWN0dWFsIFVVSUQ6IFwiJHthY3R1YWxVdWlkfVwiYCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGAgIC0gVVVJRCBtYXRjaDogJHthY3R1YWxVdWlkID09PSBleHBlY3RlZFV1aWR9YCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGAgIC0gVVVJRCBub3QgZW1wdHk6ICR7ZXhwZWN0ZWRVdWlkICE9PSAnJ31gKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYCAgLSBGaW5hbCB2ZXJpZmllZDogJHt2ZXJpZmllZH1gKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyDlr7nkuo7lhbbku5bnsbvlnovvvIznm7TmjqXmr5TovoPlgLxcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFt2ZXJpZnlQcm9wZXJ0eUNoYW5nZV0gVmFsdWUgY29tcGFyaXNvbjpgKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYCAgLSBFeHBlY3RlZCB0eXBlOiAke3R5cGVvZiBleHBlY3RlZFZhbHVlfWApO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgICAtIEFjdHVhbCB0eXBlOiAke3R5cGVvZiBhY3R1YWxWYWx1ZX1gKTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgYWN0dWFsVmFsdWUgPT09IHR5cGVvZiBleHBlY3RlZFZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGFjdHVhbFZhbHVlID09PSAnb2JqZWN0JyAmJiBhY3R1YWxWYWx1ZSAhPT0gbnVsbCAmJiBleHBlY3RlZFZhbHVlICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8g5a+56LGh57G75Z6L55qE5rex5bqm5q+U6L6DXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmVyaWZpZWQgPSBKU09OLnN0cmluZ2lmeShhY3R1YWxWYWx1ZSkgPT09IEpTT04uc3RyaW5naWZ5KGV4cGVjdGVkVmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGAgIC0gT2JqZWN0IGNvbXBhcmlzb24gKEpTT04pOiAke3ZlcmlmaWVkfWApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyDln7rmnKznsbvlnovnmoTnm7TmjqXmr5TovoNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2ZXJpZmllZCA9IGFjdHVhbFZhbHVlID09PSBleHBlY3RlZFZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGAgIC0gRGlyZWN0IGNvbXBhcmlzb246ICR7dmVyaWZpZWR9YCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyDnsbvlnovkuI3ljLnphY3ml7bnmoTnibnmrorlpITnkIbvvIjlpoLmlbDlrZflkozlrZfnrKbkuLLvvIlcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHN0cmluZ01hdGNoID0gU3RyaW5nKGFjdHVhbFZhbHVlKSA9PT0gU3RyaW5nKGV4cGVjdGVkVmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbnVtYmVyTWF0Y2ggPSBOdW1iZXIoYWN0dWFsVmFsdWUpID09PSBOdW1iZXIoZXhwZWN0ZWRWYWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB2ZXJpZmllZCA9IHN0cmluZ01hdGNoIHx8IG51bWJlck1hdGNoO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYCAgLSBTdHJpbmcgbWF0Y2g6ICR7c3RyaW5nTWF0Y2h9YCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgICAtIE51bWJlciBtYXRjaDogJHtudW1iZXJNYXRjaH1gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGAgIC0gVHlwZSBtaXNtYXRjaCB2ZXJpZmllZDogJHt2ZXJpZmllZH1gKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW3ZlcmlmeVByb3BlcnR5Q2hhbmdlXSBGaW5hbCB2ZXJpZmljYXRpb24gcmVzdWx0OiAke3ZlcmlmaWVkfWApO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbdmVyaWZ5UHJvcGVydHlDaGFuZ2VdIEZpbmFsIGFjdHVhbFZhbHVlOmAsIEpTT04uc3RyaW5naWZ5KGFjdHVhbFZhbHVlKSk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0ge1xuICAgICAgICAgICAgICAgICAgICB2ZXJpZmllZCxcbiAgICAgICAgICAgICAgICAgICAgYWN0dWFsVmFsdWUsXG4gICAgICAgICAgICAgICAgICAgIGZ1bGxEYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyDlj6rov5Tlm57kv67mlLnnmoTlsZ7mgKfkv6Hmga/vvIzkuI3ov5Tlm57lrozmlbTnu4Tku7bmlbDmja5cbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZGlmaWVkUHJvcGVydHk6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBwcm9wZXJ0eSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiZWZvcmU6IG9yaWdpbmFsVmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhwZWN0ZWQ6IGV4cGVjdGVkVmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0dWFsOiBhY3R1YWxWYWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2ZXJpZmllZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eU1ldGFkYXRhOiBwcm9wZXJ0eURhdGEgLy8g5Y+q5YyF5ZCr6L+Z5Liq5bGe5oCn55qE5YWD5pWw5o2uXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8g566A5YyW55qE57uE5Lu25L+h5oGvXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRTdW1tYXJ5OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZVV1aWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50VHlwZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b3RhbFByb3BlcnRpZXM6IE9iamVjdC5rZXlzKGNvbXBvbmVudEluZm8uZGF0YT8ucHJvcGVydGllcyB8fCB7fSkubGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbdmVyaWZ5UHJvcGVydHlDaGFuZ2VdIFJldHVybmluZyByZXN1bHQ6YCwgSlNPTi5zdHJpbmdpZnkocmVzdWx0LCBudWxsLCAyKSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFt2ZXJpZnlQcm9wZXJ0eUNoYW5nZV0gQ29tcG9uZW50SW5mbyBmYWlsZWQgb3Igbm8gZGF0YTpgLCBjb21wb25lbnRJbmZvKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1t2ZXJpZnlQcm9wZXJ0eUNoYW5nZV0gVmVyaWZpY2F0aW9uIGZhaWxlZCB3aXRoIGVycm9yOicsIGVycm9yKTtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1t2ZXJpZnlQcm9wZXJ0eUNoYW5nZV0gRXJyb3Igc3RhY2s6JywgZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLnN0YWNrIDogJ05vIHN0YWNrIHRyYWNlJyk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGNvbnNvbGUubG9nKGBbdmVyaWZ5UHJvcGVydHlDaGFuZ2VdIFJldHVybmluZyBmYWxsYmFjayByZXN1bHRgKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHZlcmlmaWVkOiBmYWxzZSxcbiAgICAgICAgICAgIGFjdHVhbFZhbHVlOiB1bmRlZmluZWQsXG4gICAgICAgICAgICBmdWxsRGF0YTogbnVsbFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOajgOa1i+aYr+WQpuS4uuiKgueCueWxnuaAp++8jOWmguaenOaYr+WImemHjeWumuWQkeWIsOWvueW6lOeahOiKgueCueaWueazlVxuICAgICAqL1xuICAgIHByaXZhdGUgYXN5bmMgY2hlY2tBbmRSZWRpcmVjdE5vZGVQcm9wZXJ0aWVzKGFyZ3M6IGFueSk6IFByb21pc2U8VG9vbFJlc3BvbnNlIHwgbnVsbD4ge1xuICAgICAgICBjb25zdCB7IG5vZGVVdWlkLCBjb21wb25lbnRUeXBlLCBwcm9wZXJ0eSwgcHJvcGVydHlUeXBlLCB2YWx1ZSB9ID0gYXJncztcbiAgICAgICAgXG4gICAgICAgIC8vIOajgOa1i+aYr+WQpuS4uuiKgueCueWfuuehgOWxnuaAp++8iOW6lOivpeS9v+eUqCBzZXRfbm9kZV9wcm9wZXJ0ee+8iVxuICAgICAgICBjb25zdCBub2RlQmFzaWNQcm9wZXJ0aWVzID0gW1xuICAgICAgICAgICAgJ25hbWUnLCAnYWN0aXZlJywgJ2xheWVyJywgJ21vYmlsaXR5JywgJ3BhcmVudCcsICdjaGlsZHJlbicsICdoaWRlRmxhZ3MnXG4gICAgICAgIF07XG4gICAgICAgIFxuICAgICAgICAvLyDmo4DmtYvmmK/lkKbkuLroioLngrnlj5jmjaLlsZ7mgKfvvIjlupTor6Xkvb/nlKggc2V0X25vZGVfdHJhbnNmb3Jt77yJXG4gICAgICAgIGNvbnN0IG5vZGVUcmFuc2Zvcm1Qcm9wZXJ0aWVzID0gW1xuICAgICAgICAgICAgJ3Bvc2l0aW9uJywgJ3JvdGF0aW9uJywgJ3NjYWxlJywgJ2V1bGVyQW5nbGVzJywgJ2FuZ2xlJ1xuICAgICAgICBdO1xuICAgICAgICBcbiAgICAgICAgLy8gRGV0ZWN0IGF0dGVtcHRzIHRvIHNldCBjYy5Ob2RlIHByb3BlcnRpZXMgKGNvbW1vbiBtaXN0YWtlKVxuICAgICAgICBpZiAoY29tcG9uZW50VHlwZSA9PT0gJ2NjLk5vZGUnIHx8IGNvbXBvbmVudFR5cGUgPT09ICdOb2RlJykge1xuICAgICAgICAgICAgaWYgKG5vZGVCYXNpY1Byb3BlcnRpZXMuaW5jbHVkZXMocHJvcGVydHkpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjogYFByb3BlcnR5ICcke3Byb3BlcnR5fScgaXMgYSBub2RlIGJhc2ljIHByb3BlcnR5LCBub3QgYSBjb21wb25lbnQgcHJvcGVydHlgLFxuICAgICAgICAgICAgICAgICAgICAgIGluc3RydWN0aW9uOiBgUGxlYXNlIHVzZSBzZXRfbm9kZV9wcm9wZXJ0eSBtZXRob2QgdG8gc2V0IG5vZGUgcHJvcGVydGllczogc2V0X25vZGVfcHJvcGVydHkodXVpZD1cIiR7bm9kZVV1aWR9XCIsIHByb3BlcnR5PVwiJHtwcm9wZXJ0eX1cIiwgdmFsdWU9JHtKU09OLnN0cmluZ2lmeSh2YWx1ZSl9KWBcbiAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAobm9kZVRyYW5zZm9ybVByb3BlcnRpZXMuaW5jbHVkZXMocHJvcGVydHkpKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgIGVycm9yOiBgUHJvcGVydHkgJyR7cHJvcGVydHl9JyBpcyBhIG5vZGUgdHJhbnNmb3JtIHByb3BlcnR5LCBub3QgYSBjb21wb25lbnQgcHJvcGVydHlgLFxuICAgICAgICAgICAgICAgICAgICAgIGluc3RydWN0aW9uOiBgUGxlYXNlIHVzZSBzZXRfbm9kZV90cmFuc2Zvcm0gbWV0aG9kIHRvIHNldCB0cmFuc2Zvcm0gcHJvcGVydGllczogc2V0X25vZGVfdHJhbnNmb3JtKHV1aWQ9XCIke25vZGVVdWlkfVwiLCAke3Byb3BlcnR5fT0ke0pTT04uc3RyaW5naWZ5KHZhbHVlKX0pYFxuICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBcbiAgICAgICAgICAvLyBEZXRlY3QgY29tbW9uIGluY29ycmVjdCB1c2FnZVxuICAgICAgICAgIGlmIChub2RlQmFzaWNQcm9wZXJ0aWVzLmluY2x1ZGVzKHByb3BlcnR5KSB8fCBub2RlVHJhbnNmb3JtUHJvcGVydGllcy5pbmNsdWRlcyhwcm9wZXJ0eSkpIHtcbiAgICAgICAgICAgICAgY29uc3QgbWV0aG9kTmFtZSA9IG5vZGVUcmFuc2Zvcm1Qcm9wZXJ0aWVzLmluY2x1ZGVzKHByb3BlcnR5KSA/ICdzZXRfbm9kZV90cmFuc2Zvcm0nIDogJ3NldF9ub2RlX3Byb3BlcnR5JztcbiAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgZXJyb3I6IGBQcm9wZXJ0eSAnJHtwcm9wZXJ0eX0nIGlzIGEgbm9kZSBwcm9wZXJ0eSwgbm90IGEgY29tcG9uZW50IHByb3BlcnR5YCxcbiAgICAgICAgICAgICAgICAgIGluc3RydWN0aW9uOiBgUHJvcGVydHkgJyR7cHJvcGVydHl9JyBzaG91bGQgYmUgc2V0IHVzaW5nICR7bWV0aG9kTmFtZX0gbWV0aG9kLCBub3Qgc2V0X2NvbXBvbmVudF9wcm9wZXJ0eS4gUGxlYXNlIHVzZTogJHttZXRob2ROYW1lfSh1dWlkPVwiJHtub2RlVXVpZH1cIiwgJHtub2RlVHJhbnNmb3JtUHJvcGVydGllcy5pbmNsdWRlcyhwcm9wZXJ0eSkgPyBwcm9wZXJ0eSA6IGBwcm9wZXJ0eT1cIiR7cHJvcGVydHl9XCJgfT0ke0pTT04uc3RyaW5naWZ5KHZhbHVlKX0pYFxuICAgICAgICAgICAgICB9O1xuICAgICAgICAgIH1cbiAgICAgICAgICBcbiAgICAgICAgICByZXR1cm4gbnVsbDsgLy8g5LiN5piv6IqC54K55bGe5oCn77yM57un57ut5q2j5bi45aSE55CGXG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICog55Sf5oiQ57uE5Lu25bu66K6u5L+h5oGvXG4gICAgICAgKi9cbiAgICAgIHByaXZhdGUgZ2VuZXJhdGVDb21wb25lbnRTdWdnZXN0aW9uKHJlcXVlc3RlZFR5cGU6IHN0cmluZywgYXZhaWxhYmxlVHlwZXM6IHN0cmluZ1tdLCBwcm9wZXJ0eTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAgICAgICAvLyDmo4Dmn6XmmK/lkKblrZjlnKjnm7jkvLznmoTnu4Tku7bnsbvlnotcbiAgICAgICAgICBjb25zdCBzaW1pbGFyVHlwZXMgPSBhdmFpbGFibGVUeXBlcy5maWx0ZXIodHlwZSA9PiBcbiAgICAgICAgICAgICAgdHlwZS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHJlcXVlc3RlZFR5cGUudG9Mb3dlckNhc2UoKSkgfHwgXG4gICAgICAgICAgICAgIHJlcXVlc3RlZFR5cGUudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyh0eXBlLnRvTG93ZXJDYXNlKCkpXG4gICAgICAgICAgKTtcbiAgICAgICAgICBcbiAgICAgICAgICBsZXQgaW5zdHJ1Y3Rpb24gPSAnJztcbiAgICAgICAgICBcbiAgICAgICAgICBpZiAoc2ltaWxhclR5cGVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgaW5zdHJ1Y3Rpb24gKz0gYFxcblxcbvCflI0gRm91bmQgc2ltaWxhciBjb21wb25lbnRzOiAke3NpbWlsYXJUeXBlcy5qb2luKCcsICcpfWA7XG4gICAgICAgICAgICAgIGluc3RydWN0aW9uICs9IGBcXG7wn5KhIFN1Z2dlc3Rpb246IFBlcmhhcHMgeW91IG1lYW50IHRvIHNldCB0aGUgJyR7c2ltaWxhclR5cGVzWzBdfScgY29tcG9uZW50P2A7XG4gICAgICAgICAgfVxuICAgICAgICAgIFxuICAgICAgICAgIC8vIFJlY29tbWVuZCBwb3NzaWJsZSBjb21wb25lbnRzIGJhc2VkIG9uIHByb3BlcnR5IG5hbWVcbiAgICAgICAgICBjb25zdCBwcm9wZXJ0eVRvQ29tcG9uZW50TWFwOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmdbXT4gPSB7XG4gICAgICAgICAgICAgICdzdHJpbmcnOiBbJ2NjLkxhYmVsJywgJ2NjLlJpY2hUZXh0JywgJ2NjLkVkaXRCb3gnXSxcbiAgICAgICAgICAgICAgJ3RleHQnOiBbJ2NjLkxhYmVsJywgJ2NjLlJpY2hUZXh0J10sXG4gICAgICAgICAgICAgICdmb250U2l6ZSc6IFsnY2MuTGFiZWwnLCAnY2MuUmljaFRleHQnXSxcbiAgICAgICAgICAgICAgJ3Nwcml0ZUZyYW1lJzogWydjYy5TcHJpdGUnXSxcbiAgICAgICAgICAgICAgJ2NvbG9yJzogWydjYy5MYWJlbCcsICdjYy5TcHJpdGUnLCAnY2MuR3JhcGhpY3MnXSxcbiAgICAgICAgICAgICAgJ25vcm1hbENvbG9yJzogWydjYy5CdXR0b24nXSxcbiAgICAgICAgICAgICAgJ3ByZXNzZWRDb2xvcic6IFsnY2MuQnV0dG9uJ10sXG4gICAgICAgICAgICAgICd0YXJnZXQnOiBbJ2NjLkJ1dHRvbiddLFxuICAgICAgICAgICAgICAnY29udGVudFNpemUnOiBbJ2NjLlVJVHJhbnNmb3JtJ10sXG4gICAgICAgICAgICAgICdhbmNob3JQb2ludCc6IFsnY2MuVUlUcmFuc2Zvcm0nXVxuICAgICAgICAgIH07XG4gICAgICAgICAgXG4gICAgICAgICAgY29uc3QgcmVjb21tZW5kZWRDb21wb25lbnRzID0gcHJvcGVydHlUb0NvbXBvbmVudE1hcFtwcm9wZXJ0eV0gfHwgW107XG4gICAgICAgICAgY29uc3QgYXZhaWxhYmxlUmVjb21tZW5kZWQgPSByZWNvbW1lbmRlZENvbXBvbmVudHMuZmlsdGVyKGNvbXAgPT4gYXZhaWxhYmxlVHlwZXMuaW5jbHVkZXMoY29tcCkpO1xuICAgICAgICAgIFxuICAgICAgICAgIGlmIChhdmFpbGFibGVSZWNvbW1lbmRlZC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgIGluc3RydWN0aW9uICs9IGBcXG5cXG7wn46vIEJhc2VkIG9uIHByb3BlcnR5ICcke3Byb3BlcnR5fScsIHJlY29tbWVuZGVkIGNvbXBvbmVudHM6ICR7YXZhaWxhYmxlUmVjb21tZW5kZWQuam9pbignLCAnKX1gO1xuICAgICAgICAgIH1cbiAgICAgICAgICBcbiAgICAgICAgICAvLyBQcm92aWRlIG9wZXJhdGlvbiBzdWdnZXN0aW9uc1xuICAgICAgICAgIGluc3RydWN0aW9uICs9IGBcXG5cXG7wn5OLIFN1Z2dlc3RlZCBBY3Rpb25zOmA7XG4gICAgICAgICAgaW5zdHJ1Y3Rpb24gKz0gYFxcbjEuIFVzZSBnZXRfY29tcG9uZW50cyhub2RlVXVpZD1cIiR7cmVxdWVzdGVkVHlwZS5pbmNsdWRlcygndXVpZCcpID8gJ1lPVVJfTk9ERV9VVUlEJyA6ICdub2RlVXVpZCd9XCIpIHRvIHZpZXcgYWxsIGNvbXBvbmVudHMgb24gdGhlIG5vZGVgO1xuICAgICAgICAgIGluc3RydWN0aW9uICs9IGBcXG4yLiBJZiB5b3UgbmVlZCB0byBhZGQgYSBjb21wb25lbnQsIHVzZSBhZGRfY29tcG9uZW50KG5vZGVVdWlkPVwiLi4uXCIsIGNvbXBvbmVudFR5cGU9XCIke3JlcXVlc3RlZFR5cGV9XCIpYDtcbiAgICAgICAgICBpbnN0cnVjdGlvbiArPSBgXFxuMy4gVmVyaWZ5IHRoYXQgdGhlIGNvbXBvbmVudCB0eXBlIG5hbWUgaXMgY29ycmVjdCAoY2FzZS1zZW5zaXRpdmUpYDtcbiAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgIHJldHVybiBpbnN0cnVjdGlvbjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDlv6vpgJ/pqozor4HotYTmupDorr7nva7nu5PmnpxcbiAgICAgKi9cbiAgICBwcml2YXRlIGFzeW5jIHF1aWNrVmVyaWZ5QXNzZXQobm9kZVV1aWQ6IHN0cmluZywgY29tcG9uZW50VHlwZTogc3RyaW5nLCBwcm9wZXJ0eTogc3RyaW5nKTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHJhd05vZGVEYXRhID0gYXdhaXQgRWRpdG9yLk1lc3NhZ2UucmVxdWVzdCgnc2NlbmUnLCAncXVlcnktbm9kZScsIG5vZGVVdWlkKTtcbiAgICAgICAgICAgIGlmICghcmF3Tm9kZURhdGEgfHwgIXJhd05vZGVEYXRhLl9fY29tcHNfXykge1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDmib7liLDnu4Tku7ZcbiAgICAgICAgICAgIGNvbnN0IGNvbXBvbmVudCA9IHJhd05vZGVEYXRhLl9fY29tcHNfXy5maW5kKChjb21wOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBjb21wVHlwZSA9IGNvbXAuX190eXBlX18gfHwgY29tcC5jaWQgfHwgY29tcC50eXBlO1xuICAgICAgICAgICAgICAgIHJldHVybiBjb21wVHlwZSA9PT0gY29tcG9uZW50VHlwZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAoIWNvbXBvbmVudCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDmj5Dlj5blsZ7mgKflgLxcbiAgICAgICAgICAgIGNvbnN0IHByb3BlcnRpZXMgPSB0aGlzLmV4dHJhY3RDb21wb25lbnRQcm9wZXJ0aWVzKGNvbXBvbmVudCk7XG4gICAgICAgICAgICBjb25zdCBwcm9wZXJ0eURhdGEgPSBwcm9wZXJ0aWVzW3Byb3BlcnR5XTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKHByb3BlcnR5RGF0YSAmJiB0eXBlb2YgcHJvcGVydHlEYXRhID09PSAnb2JqZWN0JyAmJiAndmFsdWUnIGluIHByb3BlcnR5RGF0YSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBwcm9wZXJ0eURhdGEudmFsdWU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBwcm9wZXJ0eURhdGE7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBbcXVpY2tWZXJpZnlBc3NldF0gRXJyb3I6YCwgZXJyb3IpO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDphY3nva7mjInpkq7ngrnlh7vkuovku7YgLSDnu5/kuIDmjqXlj6PmlK/mjIHmt7vliqDjgIHnp7vpmaTlkozmuIXnqbrmk43kvZxcbiAgICAgKi9cbiAgICBwcml2YXRlIGFzeW5jIGNvbmZpZ3VyZUNsaWNrRXZlbnQoYXJnczogYW55KTogUHJvbWlzZTxUb29sUmVzcG9uc2U+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHsgbm9kZVV1aWQsIG9wZXJhdGlvbiA9ICdhZGQnLCB0YXJnZXROb2RlVXVpZCwgY29tcG9uZW50TmFtZSwgaGFuZGxlck5hbWUsIGN1c3RvbUV2ZW50RGF0YSwgZXZlbnRJbmRleCB9ID0gYXJncztcblxuICAgICAgICAgICAgLy8g6YeN5paw6I635Y+W5pyA5paw55qE57uE5Lu254q25oCB77yM56Gu5L+d5pWw5o2u5ZCM5q2lXG4gICAgICAgICAgICBjb25zdCByZWZyZXNoZWRDb21wb25lbnRzID0gYXdhaXQgdGhpcy5nZXRDb21wb25lbnRzKG5vZGVVdWlkKTtcbiAgICAgICAgICAgIGlmICghcmVmcmVzaGVkQ29tcG9uZW50cy5zdWNjZXNzIHx8ICFyZWZyZXNoZWRDb21wb25lbnRzLmRhdGE/LmNvbXBvbmVudHMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdCdXR0b24gbm9kZSBub3QgZm91bmQgb3IgaGFzIG5vIGNvbXBvbmVudHMnIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IGJ1dHRvbkNvbXBvbmVudCA9IHJlZnJlc2hlZENvbXBvbmVudHMuZGF0YS5jb21wb25lbnRzLmZpbmQoKGNvbXA6IGFueSkgPT4gY29tcC50eXBlID09PSAnY2MuQnV0dG9uJyk7XG4gICAgICAgICAgICBpZiAoIWJ1dHRvbkNvbXBvbmVudCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ05vZGUgZG9lcyBub3QgaGF2ZSBhIEJ1dHRvbiBjb21wb25lbnQnIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIOiOt+WPluW9k+WJjeeahGNsaWNrRXZlbnRz5pWw57uE77yM56Gu5L+d5L2/55So5pyA5paw5pWw5o2uXG4gICAgICAgICAgICBsZXQgY3VycmVudENsaWNrRXZlbnRzOiBhbnlbXSA9IFtdO1xuICAgICAgICAgICAgaWYgKGJ1dHRvbkNvbXBvbmVudC5wcm9wZXJ0aWVzLmNsaWNrRXZlbnRzICYmIGJ1dHRvbkNvbXBvbmVudC5wcm9wZXJ0aWVzLmNsaWNrRXZlbnRzLnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudENsaWNrRXZlbnRzID0gQXJyYXkuaXNBcnJheShidXR0b25Db21wb25lbnQucHJvcGVydGllcy5jbGlja0V2ZW50cy52YWx1ZSlcbiAgICAgICAgICAgICAgICAgICAgPyBidXR0b25Db21wb25lbnQucHJvcGVydGllcy5jbGlja0V2ZW50cy52YWx1ZVxuICAgICAgICAgICAgICAgICAgICA6IFtdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgQ3VycmVudCBjbGlja0V2ZW50cyBjb3VudDogJHtjdXJyZW50Q2xpY2tFdmVudHMubGVuZ3RofSwgb3BlcmF0aW9uOiAke29wZXJhdGlvbn1gKTtcblxuICAgICAgICAgICAgY29uc3QgcHJldmlvdXNFdmVudENvdW50ID0gY3VycmVudENsaWNrRXZlbnRzLmxlbmd0aDtcbiAgICAgICAgICAgIGxldCB1cGRhdGVkQ2xpY2tFdmVudHM6IGFueVtdID0gW107XG4gICAgICAgICAgICBsZXQgbWVzc2FnZSA9ICcnO1xuXG4gICAgICAgICAgICBzd2l0Y2ggKG9wZXJhdGlvbikge1xuICAgICAgICAgICAgICAgIGNhc2UgJ21vZGlmeSc6XG4gICAgICAgICAgICAgICAgICAgIC8vIOS/ruaUueeOsOacieS6i+S7tlxuICAgICAgICAgICAgICAgICAgICBpZiAoZXZlbnRJbmRleCA9PT0gdW5kZWZpbmVkIHx8IGV2ZW50SW5kZXggPCAwIHx8IGV2ZW50SW5kZXggPj0gY3VycmVudENsaWNrRXZlbnRzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjogYEludmFsaWQgZXZlbnQgaW5kZXggJHtldmVudEluZGV4fS4gQXZhaWxhYmxlIGluZGljZXM6IDAtJHtjdXJyZW50Q2xpY2tFdmVudHMubGVuZ3RoIC0gMX1gXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgLy8g5qC55o2u57yW6L6R5Zmo55qE6KGM5Li65LyY5YyW77ya5rex5ou36LSd5LqL5Lu25pWw5o2u5Lul6YG/5YWN55u05o6l5L+u5pS55byV55SoXG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZWRDbGlja0V2ZW50cyA9IFsuLi5jdXJyZW50Q2xpY2tFdmVudHNdO1xuICAgICAgICAgICAgICAgICAgICAvLyDmt7Hmi7fotJ3opoHkv67mlLnnmoTkuovku7bvvIzpgb/lhY3kv67mlLnljp/lp4vmlbDmja5cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXhpc3RpbmdFdmVudCA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoY3VycmVudENsaWNrRXZlbnRzW2V2ZW50SW5kZXhdKSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8g5aaC5p6c6KaB5L+u5pS555uu5qCH6IqC54K55oiW57uE5Lu277yM6ZyA6KaB5a6M5pW06aqM6K+BXG4gICAgICAgICAgICAgICAgICAgIGlmICh0YXJnZXROb2RlVXVpZCAhPT0gdW5kZWZpbmVkIHx8IGNvbXBvbmVudE5hbWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8g56Gu5a6a6KaB6aqM6K+B55qE6IqC54K55ZKM57uE5Lu2XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBub2RlVG9WZXJpZnkgPSB0YXJnZXROb2RlVXVpZCB8fCBleGlzdGluZ0V2ZW50LnZhbHVlLnRhcmdldC52YWx1ZS51dWlkO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY29tcFRvVmVyaWZ5ID0gY29tcG9uZW50TmFtZSB8fCBleGlzdGluZ0V2ZW50LnZhbHVlLl9jb21wb25lbnRJZC52YWx1ZTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gMS4g6aaW5YWI6aqM6K+B6IqC54K55piv5ZCm5a2Y5ZyoXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGFyZ2V0Tm9kZVV1aWQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHZlcmlmeU5vZGVDb21wb25lbnRzID0gYXdhaXQgdGhpcy5nZXRDb21wb25lbnRzKHRhcmdldE5vZGVVdWlkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXZlcmlmeU5vZGVDb21wb25lbnRzLnN1Y2Nlc3MgfHwgIXZlcmlmeU5vZGVDb21wb25lbnRzLmRhdGE/LmNvbXBvbmVudHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGBUYXJnZXQgbm9kZSAnJHt0YXJnZXROb2RlVXVpZH0nIG5vdCBmb3VuZCBvciBoYXMgbm8gY29tcG9uZW50c2BcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAyLiDlpoLmnpzlkIzml7bopoHkv67mlLnnu4Tku7bvvIzpqozor4Hnu4Tku7bmmK/lkKblrZjlnKhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY29tcG9uZW50TmFtZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHZlcmlmeVRhcmdldENvbXBvbmVudCA9IHZlcmlmeU5vZGVDb21wb25lbnRzLmRhdGEuY29tcG9uZW50cy5maW5kKChjb21wOiBhbnkpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wLnR5cGUgPT09IGNvbXBvbmVudE5hbWUgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChjb21wLnByb3BlcnRpZXMgJiYgY29tcC5wcm9wZXJ0aWVzLl9uYW1lICYmIGNvbXAucHJvcGVydGllcy5fbmFtZS52YWx1ZSA9PT0gY29tcG9uZW50TmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXZlcmlmeVRhcmdldENvbXBvbmVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjogYENvbXBvbmVudCAnJHtjb21wb25lbnROYW1lfScgbm90IGZvdW5kIG9uIHRhcmdldCBub2RlLiBBdmFpbGFibGUgY29tcG9uZW50czogJHt2ZXJpZnlOb2RlQ29tcG9uZW50cy5kYXRhLmNvbXBvbmVudHMubWFwKChjOiBhbnkpID0+IGMudHlwZSkuam9pbignLCAnKX1gXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAzLiDpqozor4EgaGFuZGxlciDmlrnms5XmmK/lkKblrZjlnKhcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChoYW5kbGVyTmFtZSAhPT0gdW5kZWZpbmVkICYmIG5vZGVUb1ZlcmlmeSAmJiBjb21wVG9WZXJpZnkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgVmVyaWZ5aW5nIGhhbmRsZXIgJyR7aGFuZGxlck5hbWV9JyBvbiBub2RlICR7bm9kZVRvVmVyaWZ5fSwgY29tcG9uZW50ICR7Y29tcFRvVmVyaWZ5fWApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjb21wb25lbnRGdW5jdGlvbnMgPSBhd2FpdCBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdzY2VuZScsICdxdWVyeS1jb21wb25lbnQtZnVuY3Rpb24tb2Ytbm9kZScsIG5vZGVUb1ZlcmlmeSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdDb21wb25lbnQgZnVuY3Rpb25zIGZvciBtb2RpZnk6JywgY29tcG9uZW50RnVuY3Rpb25zKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgaGFuZGxlckZvdW5kID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb21wb25lbnRGdW5jdGlvbnMgJiYgQXJyYXkuaXNBcnJheShjb21wb25lbnRGdW5jdGlvbnMpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGNvbXBGdW5jcyBvZiBjb21wb25lbnRGdW5jdGlvbnMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY29tcEZ1bmNzLmNvbXBvbmVudCA9PT0gY29tcFRvVmVyaWZ5IHx8IGNvbXBGdW5jcy5uYW1lID09PSBjb21wVG9WZXJpZnkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNvbXBGdW5jcy5mdW5jdGlvbnMgJiYgQXJyYXkuaXNBcnJheShjb21wRnVuY3MuZnVuY3Rpb25zKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlckZvdW5kID0gY29tcEZ1bmNzLmZ1bmN0aW9ucy5zb21lKChmdW5jOiBhbnkpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZnVuYyA9PT0gaGFuZGxlck5hbWUgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAodHlwZW9mIGZ1bmMgPT09ICdvYmplY3QnICYmIGZ1bmMubmFtZSA9PT0gaGFuZGxlck5hbWUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGhhbmRsZXJGb3VuZCkgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY29tcG9uZW50RnVuY3Rpb25zICYmIHR5cGVvZiBjb21wb25lbnRGdW5jdGlvbnMgPT09ICdvYmplY3QnICYmIGNvbXBvbmVudEZ1bmN0aW9uc1tjb21wVG9WZXJpZnldKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBmdW5jcyA9IGNvbXBvbmVudEZ1bmN0aW9uc1tjb21wVG9WZXJpZnldO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoZnVuY3MpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlckZvdW5kID0gZnVuY3MuaW5jbHVkZXMoaGFuZGxlck5hbWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChmdW5jcy5mdW5jdGlvbnMgJiYgQXJyYXkuaXNBcnJheShmdW5jcy5mdW5jdGlvbnMpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlckZvdW5kID0gZnVuY3MuZnVuY3Rpb25zLmluY2x1ZGVzKGhhbmRsZXJOYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghaGFuZGxlckZvdW5kKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYEhhbmRsZXIgJyR7aGFuZGxlck5hbWV9JyBub3QgZm91bmQgaW4gY29tcG9uZW50ICcke2NvbXBUb1ZlcmlmeX0nIG9uIG5vZGUgJHtub2RlVG9WZXJpZnl9LiBUaGlzIG1pZ2h0IGJlIGEgY3VzdG9tIG1ldGhvZC5gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIOS4jemYu+atouaTjeS9nO+8jOWboOS4uuWPr+iDveaYr+iHquWumuS5ieaWueazlVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byB2ZXJpZnkgaGFuZGxlciBmb3IgbW9kaWZ5IG9wZXJhdGlvbjonLCBlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyDmn6Xor6LlpLHotKXkuI3lupTor6XpmLvmraLmk43kvZxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAvLyDmm7TmlrDmjIflrprnmoTlsZ7mgKdcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRhcmdldE5vZGVVdWlkICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4aXN0aW5nRXZlbnQudmFsdWUudGFyZ2V0LnZhbHVlLnV1aWQgPSB0YXJnZXROb2RlVXVpZDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoY29tcG9uZW50TmFtZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBleGlzdGluZ0V2ZW50LnZhbHVlLl9jb21wb25lbnRJZC52YWx1ZSA9IGNvbXBvbmVudE5hbWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGhhbmRsZXJOYW1lICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4aXN0aW5nRXZlbnQudmFsdWUuaGFuZGxlci52YWx1ZSA9IGhhbmRsZXJOYW1lO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChjdXN0b21FdmVudERhdGEgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXhpc3RpbmdFdmVudC52YWx1ZS5jdXN0b21FdmVudERhdGEudmFsdWUgPSBjdXN0b21FdmVudERhdGE7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAvLyDlsIbkv67mlLnlkI7nmoTkuovku7bmlL7lm57mlbDnu4RcbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlZENsaWNrRXZlbnRzW2V2ZW50SW5kZXhdID0gZXhpc3RpbmdFdmVudDtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZSA9IGBDbGljayBldmVudCBhdCBpbmRleCAke2V2ZW50SW5kZXh9IG1vZGlmaWVkIHN1Y2Nlc3NmdWxseWA7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgY2FzZSAnYWRkJzpcbiAgICAgICAgICAgICAgICAgICAgLy8g6aqM6K+B55uu5qCH6IqC54K55ZKM57uE5Lu25piv5ZCm5a2Y5ZyoXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHRhcmdldENvbXBvbmVudHMgPSBhd2FpdCB0aGlzLmdldENvbXBvbmVudHModGFyZ2V0Tm9kZVV1aWQpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXRhcmdldENvbXBvbmVudHMuc3VjY2VzcyB8fCAhdGFyZ2V0Q29tcG9uZW50cy5kYXRhPy5jb21wb25lbnRzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6ICdUYXJnZXQgbm9kZSBub3QgZm91bmQgb3IgaGFzIG5vIGNvbXBvbmVudHMnIH07XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBjb25zdCB0YXJnZXRDb21wb25lbnQgPSB0YXJnZXRDb21wb25lbnRzLmRhdGEuY29tcG9uZW50cy5maW5kKChjb21wOiBhbnkpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICBjb21wLnR5cGUgPT09IGNvbXBvbmVudE5hbWUgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgIChjb21wLnByb3BlcnRpZXMgJiYgY29tcC5wcm9wZXJ0aWVzLl9uYW1lICYmIGNvbXAucHJvcGVydGllcy5fbmFtZS52YWx1ZSA9PT0gY29tcG9uZW50TmFtZSlcbiAgICAgICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoIXRhcmdldENvbXBvbmVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjogYENvbXBvbmVudCAnJHtjb21wb25lbnROYW1lfScgbm90IGZvdW5kIG9uIHRhcmdldCBub2RlLiBBdmFpbGFibGUgY29tcG9uZW50czogJHt0YXJnZXRDb21wb25lbnRzLmRhdGEuY29tcG9uZW50cy5tYXAoKGM6IGFueSkgPT4gYy50eXBlKS5qb2luKCcsICcpfWBcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAvLyDpqozor4EgaGFuZGxlciDmlrnms5XmmK/lkKblrZjlnKjkuo7nm67moIfnu4Tku7bkuK1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGhhbmRsZXJOYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBRdWVyeWluZyBjb21wb25lbnQgZnVuY3Rpb25zIGZvciBub2RlOiAke3RhcmdldE5vZGVVdWlkfWApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbXBvbmVudEZ1bmN0aW9ucyA9IGF3YWl0IEVkaXRvci5NZXNzYWdlLnJlcXVlc3QoJ3NjZW5lJywgJ3F1ZXJ5LWNvbXBvbmVudC1mdW5jdGlvbi1vZi1ub2RlJywgdGFyZ2V0Tm9kZVV1aWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdDb21wb25lbnQgZnVuY3Rpb25zIHJlc3VsdDonLCBjb21wb25lbnRGdW5jdGlvbnMpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8g5qOA5p+l6L+U5Zue55qE5Ye95pWw5YiX6KGo5Lit5piv5ZCm5YyF5ZCr5oyH5a6a55qEIGhhbmRsZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgaGFuZGxlckZvdW5kID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNvbXBvbmVudEZ1bmN0aW9ucyAmJiBBcnJheS5pc0FycmF5KGNvbXBvbmVudEZ1bmN0aW9ucykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8g6YGN5Y6G5omA5pyJ57uE5Lu255qE5Ye95pWwXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgY29tcEZ1bmNzIG9mIGNvbXBvbmVudEZ1bmN0aW9ucykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNvbXBGdW5jcy5jb21wb25lbnQgPT09IGNvbXBvbmVudE5hbWUgfHwgY29tcEZ1bmNzLm5hbWUgPT09IGNvbXBvbmVudE5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyDmo4Dmn6Xor6Xnu4Tku7bnmoTlh73mlbDliJfooahcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY29tcEZ1bmNzLmZ1bmN0aW9ucyAmJiBBcnJheS5pc0FycmF5KGNvbXBGdW5jcy5mdW5jdGlvbnMpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhbmRsZXJGb3VuZCA9IGNvbXBGdW5jcy5mdW5jdGlvbnMuc29tZSgoZnVuYzogYW55KSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZnVuYyA9PT0gaGFuZGxlck5hbWUgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICh0eXBlb2YgZnVuYyA9PT0gJ29iamVjdCcgJiYgZnVuYy5uYW1lID09PSBoYW5kbGVyTmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGhhbmRsZXJGb3VuZCkgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjb21wb25lbnRGdW5jdGlvbnMgJiYgdHlwZW9mIGNvbXBvbmVudEZ1bmN0aW9ucyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8g5Y+v6IO96L+U5Zue55qE5piv5a+56LGh5qC85byPXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb21wb25lbnRGdW5jdGlvbnNbY29tcG9uZW50TmFtZV0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGZ1bmNzID0gY29tcG9uZW50RnVuY3Rpb25zW2NvbXBvbmVudE5hbWVdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoZnVuY3MpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlckZvdW5kID0gZnVuY3MuaW5jbHVkZXMoaGFuZGxlck5hbWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChmdW5jcy5mdW5jdGlvbnMgJiYgQXJyYXkuaXNBcnJheShmdW5jcy5mdW5jdGlvbnMpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlckZvdW5kID0gZnVuY3MuZnVuY3Rpb25zLmluY2x1ZGVzKGhhbmRsZXJOYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghaGFuZGxlckZvdW5kKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgSGFuZGxlciAnJHtoYW5kbGVyTmFtZX0nIG5vdCBmb3VuZCBpbiBjb21wb25lbnQgJyR7Y29tcG9uZW50TmFtZX0nIGZ1bmN0aW9ucy4gVGhpcyBtaWdodCBiZSBhIGN1c3RvbSBtZXRob2Qgb3IgdGhlIHF1ZXJ5IGZhaWxlZC5gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8g5LiN6KaB55u05o6l5aSx6LSl77yM5Zug5Li65Y+v6IO95piv6Ieq5a6a5LmJ5pa55rOV5oiW5p+l6K+i5aSx6LSlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIOWPquaYr+iusOW9leitpuWRiu+8jOiuqeaTjeS9nOe7p+e7rVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBxdWVyeSBjb21wb25lbnQgZnVuY3Rpb25zOicsIGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8g5p+l6K+i5aSx6LSl5LiN5bqU6K+l6Zi75q2i5pON5L2c77yM5Y+q6K6w5b2V6ZSZ6K+vXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAvLyDmnoTlu7rnrKblkIhDb2NvcyBDcmVhdG9y57yW6L6R5Zmo5qC85byP55qE54K55Ye75LqL5Lu26YWN572uXG4gICAgICAgICAgICAgICAgICAgIC8vIOWfuuS6juWunumZheS6i+S7tue7k+aehOWIhuaekO+8jOS9v+eUqOWujOaVtOeahOW1jOWll+agvOW8j1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjbGlja0V2ZW50RGF0YSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IFwidGFyZ2V0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiB7IHV1aWQ6IHRhcmdldE5vZGVVdWlkIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IFwiY2MuTm9kZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWFkb25seTogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpc2libGU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGFibGU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvb2x0aXA6IFwiaTE4bjpFTkdJTkUuYnV0dG9uLmNsaWNrX2V2ZW50LnRhcmdldFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5TmFtZTogXCJpMThuOkVOR0lORS5jbGFzc2VzLmNjLkNsaWNrRXZlbnQucHJvcGVydGllcy50YXJnZXQuZGlzcGxheU5hbWVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXh0ZW5kczogW1wiY2MuT2JqZWN0XCJdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogXCJjb21wb25lbnRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IFwiXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6IFwiXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IFwiU3RyaW5nXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlYWRvbmx5OiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlzaWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9vbHRpcDogXCJpMThuOkVOR0lORS5idXR0b24uY2xpY2tfZXZlbnQuY29tcG9uZW50XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXlOYW1lOiBcImkxOG46RU5HSU5FLmNsYXNzZXMuY2MuQ2xpY2tFdmVudC5wcm9wZXJ0aWVzLmNvbXBvbmVudC5kaXNwbGF5TmFtZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHRlbmRzOiBbXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX2NvbXBvbmVudElkOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IFwiX2NvbXBvbmVudElkXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBjb21wb25lbnROYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OiBcIlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBcIlN0cmluZ1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWFkb25seTogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpc2libGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5TmFtZTogXCJpMThuOkVOR0lORS5jbGFzc2VzLmNjLkNsaWNrRXZlbnQucHJvcGVydGllcy5fY29tcG9uZW50SWQuZGlzcGxheU5hbWVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9vbHRpcDogXCJpMThuOkVOR0lORS5jbGFzc2VzLmNjLkNsaWNrRXZlbnQucHJvcGVydGllcy5fY29tcG9uZW50SWQudG9vbHRpcFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHRlbmRzOiBbXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlcjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBcImhhbmRsZXJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGhhbmRsZXJOYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OiBcIlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBcIlN0cmluZ1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWFkb25seTogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpc2libGU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGFibGU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvb2x0aXA6IFwiaTE4bjpFTkdJTkUuYnV0dG9uLmNsaWNrX2V2ZW50LmhhbmRsZXJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheU5hbWU6IFwiaTE4bjpFTkdJTkUuY2xhc3Nlcy5jYy5DbGlja0V2ZW50LnByb3BlcnRpZXMuaGFuZGxlci5kaXNwbGF5TmFtZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHRlbmRzOiBbXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VzdG9tRXZlbnREYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IFwiY3VzdG9tRXZlbnREYXRhXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBjdXN0b21FdmVudERhdGEgfHwgXCJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDogXCJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJTdHJpbmdcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVhZG9ubHk6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2aXNpYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b29sdGlwOiBcImkxOG46RU5HSU5FLmJ1dHRvbi5jbGlja19ldmVudC5jdXN0b21FdmVudERhdGFcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheU5hbWU6IFwiaTE4bjpFTkdJTkUuY2xhc3Nlcy5jYy5DbGlja0V2ZW50LnByb3BlcnRpZXMuY3VzdG9tRXZlbnREYXRhLmRpc3BsYXlOYW1lXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4dGVuZHM6IFtdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBcImNjLkNsaWNrRXZlbnRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IFwidGFyZ2V0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogeyB1dWlkOiBcIlwiIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJjYy5Ob2RlXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWFkb25seTogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2aXNpYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvb2x0aXA6IFwiaTE4bjpFTkdJTkUuYnV0dG9uLmNsaWNrX2V2ZW50LnRhcmdldFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheU5hbWU6IFwiaTE4bjpFTkdJTkUuY2xhc3Nlcy5jYy5DbGlja0V2ZW50LnByb3BlcnRpZXMudGFyZ2V0LmRpc3BsYXlOYW1lXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHRlbmRzOiBbXCJjYy5PYmplY3RcIl1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBcImNvbXBvbmVudFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IFwiXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OiBcIlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJTdHJpbmdcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlYWRvbmx5OiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpc2libGU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9vbHRpcDogXCJpMThuOkVOR0lORS5idXR0b24uY2xpY2tfZXZlbnQuY29tcG9uZW50XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5TmFtZTogXCJpMThuOkVOR0lORS5jbGFzc2VzLmNjLkNsaWNrRXZlbnQucHJvcGVydGllcy5jb21wb25lbnQuZGlzcGxheU5hbWVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4dGVuZHM6IFtdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9jb21wb25lbnRJZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogXCJfY29tcG9uZW50SWRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBcIlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDogXCJcIixcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJTdHJpbmdcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlYWRvbmx5OiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpc2libGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXlOYW1lOiBcImkxOG46RU5HSU5FLmNsYXNzZXMuY2MuQ2xpY2tFdmVudC5wcm9wZXJ0aWVzLl9jb21wb25lbnRJZC5kaXNwbGF5TmFtZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9vbHRpcDogXCJpMThuOkVOR0lORS5jbGFzc2VzLmNjLkNsaWNrRXZlbnQucHJvcGVydGllcy5fY29tcG9uZW50SWQudG9vbHRpcFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXh0ZW5kczogW11cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlcjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogXCJoYW5kbGVyXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogXCJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6IFwiXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBcIlN0cmluZ1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVhZG9ubHk6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlzaWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGFibGU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b29sdGlwOiBcImkxOG46RU5HSU5FLmJ1dHRvbi5jbGlja19ldmVudC5oYW5kbGVyXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5TmFtZTogXCJpMThuOkVOR0lORS5jbGFzc2VzLmNjLkNsaWNrRXZlbnQucHJvcGVydGllcy5oYW5kbGVyLmRpc3BsYXlOYW1lXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHRlbmRzOiBbXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXN0b21FdmVudERhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IFwiY3VzdG9tRXZlbnREYXRhXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogXCJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6IFwiXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBcIlN0cmluZ1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVhZG9ubHk6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlzaWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGFibGU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b29sdGlwOiBcImkxOG46RU5HSU5FLmJ1dHRvbi5jbGlja19ldmVudC5jdXN0b21FdmVudERhdGFcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXlOYW1lOiBcImkxOG46RU5HSU5FLmNsYXNzZXMuY2MuQ2xpY2tFdmVudC5wcm9wZXJ0aWVzLmN1c3RvbUV2ZW50RGF0YS5kaXNwbGF5TmFtZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXh0ZW5kczogW11cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBcImNjLkNsaWNrRXZlbnRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlYWRvbmx5OiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZpc2libGU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgdG9vbHRpcDogXCJpMThuOkVOR0lORS5idXR0b24uY2xpY2tfZXZlbnRzXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5T3JkZXI6IDIwLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXh0ZW5kczogW11cbiAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICB1cGRhdGVkQ2xpY2tFdmVudHMgPSBbLi4uY3VycmVudENsaWNrRXZlbnRzLCBjbGlja0V2ZW50RGF0YV07XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBgQ2xpY2sgZXZlbnQgYWRkZWQgc3VjY2Vzc2Z1bGx5OiAke3RhcmdldE5vZGVVdWlkfS4ke2NvbXBvbmVudE5hbWV9LiR7aGFuZGxlck5hbWV9KClgO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgIGNhc2UgJ3JlbW92ZSc6XG4gICAgICAgICAgICAgICAgICAgIGlmIChldmVudEluZGV4ID09PSB1bmRlZmluZWQgfHwgZXZlbnRJbmRleCA8IDAgfHwgZXZlbnRJbmRleCA+PSBjdXJyZW50Q2xpY2tFdmVudHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOiBgSW52YWxpZCBldmVudCBpbmRleCAke2V2ZW50SW5kZXh9LiBBdmFpbGFibGUgaW5kaWNlczogMC0ke2N1cnJlbnRDbGlja0V2ZW50cy5sZW5ndGggLSAxfWBcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB1cGRhdGVkQ2xpY2tFdmVudHMgPSBjdXJyZW50Q2xpY2tFdmVudHMuZmlsdGVyKChfLCBpbmRleCkgPT4gaW5kZXggIT09IGV2ZW50SW5kZXgpO1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlID0gYENsaWNrIGV2ZW50IGF0IGluZGV4ICR7ZXZlbnRJbmRleH0gcmVtb3ZlZCBzdWNjZXNzZnVsbHlgO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgIGNhc2UgJ2NsZWFyJzpcbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlZENsaWNrRXZlbnRzID0gW107XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBgQWxsIGNsaWNrIGV2ZW50cyBjbGVhcmVkIHN1Y2Nlc3NmdWxseSAocmVtb3ZlZCAke2N1cnJlbnRDbGlja0V2ZW50cy5sZW5ndGh9IGV2ZW50cylgO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogYFVua25vd24gb3BlcmF0aW9uOiAke29wZXJhdGlvbn1gIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIOS9v+eUqEVkaXRvcueahHNldC1wcm9wZXJ0eea2iOaBr+iuvue9rmNsaWNrRXZlbnRzXG4gICAgICAgICAgICAvLyDmib7liLBCdXR0b27nu4Tku7blnKjnu4Tku7bmlbDnu4TkuK3nmoTntKLlvJXkvY3nva5cbiAgICAgICAgICAgIGNvbnN0IGJ1dHRvbkluZGV4ID0gcmVmcmVzaGVkQ29tcG9uZW50cy5kYXRhLmNvbXBvbmVudHMuZmluZEluZGV4KChjb21wOiBhbnkpID0+IGNvbXAudHlwZSA9PT0gJ2NjLkJ1dHRvbicpO1xuXG4gICAgICAgICAgICBpZiAoYnV0dG9uSW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnQnV0dG9uIGNvbXBvbmVudCBpbmRleCBub3QgZm91bmQnIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBTZXR0aW5nIGNsaWNrRXZlbnRzIGZvciBCdXR0b24gYXQgaW5kZXggJHtidXR0b25JbmRleH0sIG9wZXJhdGlvbjogJHtvcGVyYXRpb259YCk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgUHJldmlvdXMgZXZlbnQgY291bnQ6ICR7cHJldmlvdXNFdmVudENvdW50fSwgTmV3IGV2ZW50IGNvdW50OiAke3VwZGF0ZWRDbGlja0V2ZW50cy5sZW5ndGh9YCk7XG5cbiAgICAgICAgICAgIC8vIOS9v+eUqOato+ehrueahOe8lui+keWZqEFQSeagvOW8j++8jOagueaNruW8leaTjua6kOeggeWIhuaekOeahOe7k+aenFxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBFZGl0b3IuTWVzc2FnZS5yZXF1ZXN0KCdzY2VuZScsICdzZXQtcHJvcGVydHknLCB7XG4gICAgICAgICAgICAgICAgICAgIHV1aWQ6IG5vZGVVdWlkLFxuICAgICAgICAgICAgICAgICAgICBwYXRoOiBgX19jb21wc19fLiR7YnV0dG9uSW5kZXh9LmNsaWNrRXZlbnRzYCxcbiAgICAgICAgICAgICAgICAgICAgZHVtcDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2NjLkNsaWNrRXZlbnQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgaXNBcnJheTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiB1cGRhdGVkQ2xpY2tFdmVudHNcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdzZXQtcHJvcGVydHkgcmVzdWx0OicsIHJlc3VsdCk7XG5cbiAgICAgICAgICAgICAgICAvLyDnrYnlvoXkuIDmrrXml7bpl7TorqlFZGl0b3LlrozmiJDmm7TmlrBcbiAgICAgICAgICAgICAgICBhd2FpdCBuZXcgUHJvbWlzZShyID0+IHNldFRpbWVvdXQociwgMzAwKSk7XG5cbiAgICAgICAgICAgICAgICAvLyDph43mlrDojrflj5bnu4Tku7bnirbmgIHku6Xpqozor4Hkv67mlLnmmK/lkKbmiJDlip9cbiAgICAgICAgICAgICAgICBjb25zdCB2ZXJpZnlDb21wb25lbnRzID0gYXdhaXQgdGhpcy5nZXRDb21wb25lbnRzKG5vZGVVdWlkKTtcbiAgICAgICAgICAgICAgICBpZiAoIXZlcmlmeUNvbXBvbmVudHMuc3VjY2VzcyB8fCAhdmVyaWZ5Q29tcG9uZW50cy5kYXRhPy5jb21wb25lbnRzKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOiAnRmFpbGVkIHRvIHZlcmlmeSBjbGljayBldmVudCBjaGFuZ2VzIC0gY2Fubm90IHJldHJpZXZlIGNvbXBvbmVudCBkYXRhJ1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGNvbnN0IHZlcmlmeUJ1dHRvbiA9IHZlcmlmeUNvbXBvbmVudHMuZGF0YS5jb21wb25lbnRzLmZpbmQoKGNvbXA6IGFueSkgPT4gY29tcC50eXBlID09PSAnY2MuQnV0dG9uJyk7XG4gICAgICAgICAgICAgICAgaWYgKCF2ZXJpZnlCdXR0b24pIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6ICdGYWlsZWQgdG8gdmVyaWZ5IGNsaWNrIGV2ZW50IGNoYW5nZXMgLSBCdXR0b24gY29tcG9uZW50IG5vdCBmb3VuZCdcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyDojrflj5bmm7TmlrDlkI7nmoRjbGlja0V2ZW50c1xuICAgICAgICAgICAgICAgIGxldCB2ZXJpZmllZENsaWNrRXZlbnRzOiBhbnlbXSA9IFtdO1xuICAgICAgICAgICAgICAgIGlmICh2ZXJpZnlCdXR0b24ucHJvcGVydGllcy5jbGlja0V2ZW50cyAmJiB2ZXJpZnlCdXR0b24ucHJvcGVydGllcy5jbGlja0V2ZW50cy52YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICB2ZXJpZmllZENsaWNrRXZlbnRzID0gQXJyYXkuaXNBcnJheSh2ZXJpZnlCdXR0b24ucHJvcGVydGllcy5jbGlja0V2ZW50cy52YWx1ZSlcbiAgICAgICAgICAgICAgICAgICAgICAgID8gdmVyaWZ5QnV0dG9uLnByb3BlcnRpZXMuY2xpY2tFdmVudHMudmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgIDogW107XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY29uc3QgdmVyaWZpZWRFdmVudENvdW50ID0gdmVyaWZpZWRDbGlja0V2ZW50cy5sZW5ndGg7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFZlcmlmaWNhdGlvbiAtIEV4cGVjdGVkIGV2ZW50IGNvdW50OiAke3VwZGF0ZWRDbGlja0V2ZW50cy5sZW5ndGh9LCBBY3R1YWwgZXZlbnQgY291bnQ6ICR7dmVyaWZpZWRFdmVudENvdW50fWApO1xuXG4gICAgICAgICAgICAgICAgLy8g6aqM6K+B5LqL5Lu25pWw6YeP5piv5ZCm5q2j56GuXG4gICAgICAgICAgICAgICAgbGV0IHZlcmlmaWNhdGlvblN1Y2Nlc3MgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKG9wZXJhdGlvbikge1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdhZGQnOlxuICAgICAgICAgICAgICAgICAgICAgICAgdmVyaWZpY2F0aW9uU3VjY2VzcyA9IHZlcmlmaWVkRXZlbnRDb3VudCA9PT0gcHJldmlvdXNFdmVudENvdW50ICsgMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdyZW1vdmUnOlxuICAgICAgICAgICAgICAgICAgICAgICAgdmVyaWZpY2F0aW9uU3VjY2VzcyA9IHZlcmlmaWVkRXZlbnRDb3VudCA9PT0gcHJldmlvdXNFdmVudENvdW50IC0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdjbGVhcic6XG4gICAgICAgICAgICAgICAgICAgICAgICB2ZXJpZmljYXRpb25TdWNjZXNzID0gdmVyaWZpZWRFdmVudENvdW50ID09PSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ21vZGlmeSc6XG4gICAgICAgICAgICAgICAgICAgICAgICB2ZXJpZmljYXRpb25TdWNjZXNzID0gdmVyaWZpZWRFdmVudENvdW50ID09PSBwcmV2aW91c0V2ZW50Q291bnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyDlr7nkuo7kv67mlLnmk43kvZzvvIzov5jpnIDopoHpqozor4HlhbfkvZPnmoTkv67mlLnmmK/lkKbnlJ/mlYhcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh2ZXJpZmljYXRpb25TdWNjZXNzICYmIGV2ZW50SW5kZXggIT09IHVuZGVmaW5lZCAmJiB2ZXJpZmllZENsaWNrRXZlbnRzW2V2ZW50SW5kZXhdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbW9kaWZpZWRFdmVudCA9IHZlcmlmaWVkQ2xpY2tFdmVudHNbZXZlbnRJbmRleF07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRhcmdldE5vZGVVdWlkICE9PSB1bmRlZmluZWQgJiYgbW9kaWZpZWRFdmVudC52YWx1ZS50YXJnZXQudmFsdWUudXVpZCAhPT0gdGFyZ2V0Tm9kZVV1aWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmVyaWZpY2F0aW9uU3VjY2VzcyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgTW9kaWZ5IHZlcmlmaWNhdGlvbiBmYWlsZWQ6IHRhcmdldCBVVUlEIG1pc21hdGNoYCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb21wb25lbnROYW1lICE9PSB1bmRlZmluZWQgJiYgbW9kaWZpZWRFdmVudC52YWx1ZS5fY29tcG9uZW50SWQudmFsdWUgIT09IGNvbXBvbmVudE5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmVyaWZpY2F0aW9uU3VjY2VzcyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgTW9kaWZ5IHZlcmlmaWNhdGlvbiBmYWlsZWQ6IGNvbXBvbmVudCBuYW1lIG1pc21hdGNoYCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChoYW5kbGVyTmFtZSAhPT0gdW5kZWZpbmVkICYmIG1vZGlmaWVkRXZlbnQudmFsdWUuaGFuZGxlci52YWx1ZSAhPT0gaGFuZGxlck5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmVyaWZpY2F0aW9uU3VjY2VzcyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgTW9kaWZ5IHZlcmlmaWNhdGlvbiBmYWlsZWQ6IGhhbmRsZXIgbmFtZSBtaXNtYXRjaGApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY3VzdG9tRXZlbnREYXRhICE9PSB1bmRlZmluZWQgJiYgbW9kaWZpZWRFdmVudC52YWx1ZS5jdXN0b21FdmVudERhdGEudmFsdWUgIT09IGN1c3RvbUV2ZW50RGF0YSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2ZXJpZmljYXRpb25TdWNjZXNzID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBNb2RpZnkgdmVyaWZpY2F0aW9uIGZhaWxlZDogY3VzdG9tIGRhdGEgbWlzbWF0Y2hgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAodmVyaWZpY2F0aW9uU3VjY2Vzcykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IG1lc3NhZ2UgKyAnICh2ZXJpZmllZCknLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVVdWlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wZXJhdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcmV2aW91c0V2ZW50Q291bnQ6IHByZXZpb3VzRXZlbnRDb3VudCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdFdmVudENvdW50OiB2ZXJpZmllZEV2ZW50Q291bnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmVyaWZpZWQ6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xpY2tFdmVudHM6IHZlcmlmaWVkQ2xpY2tFdmVudHNcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjogYENsaWNrIGV2ZW50ICR7b3BlcmF0aW9ufSBvcGVyYXRpb24gZmFpbGVkIHZlcmlmaWNhdGlvbi4gRXhwZWN0ZWQgJHt1cGRhdGVkQ2xpY2tFdmVudHMubGVuZ3RofSBldmVudHMsIGJ1dCBmb3VuZCAke3ZlcmlmaWVkRXZlbnRDb3VudH0gZXZlbnRzLmAsXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZVV1aWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3BlcmF0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4cGVjdGVkRXZlbnRDb3VudDogdXBkYXRlZENsaWNrRXZlbnRzLmxlbmd0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3R1YWxFdmVudENvdW50OiB2ZXJpZmllZEV2ZW50Q291bnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJldmlvdXNFdmVudENvdW50OiBwcmV2aW91c0V2ZW50Q291bnRcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGNhdGNoIChlcnI6IGFueSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBlcnJvcjogYEVkaXRvciBBUEkgZXJyb3I6ICR7ZXJyLm1lc3NhZ2V9YFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSBjYXRjaCAoZXJyOiBhbnkpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICAgICAgICAgICAgZXJyb3I6IGBDb25maWd1cmF0aW9uIGVycm9yOiAke2Vyci5tZXNzYWdlfWBcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=