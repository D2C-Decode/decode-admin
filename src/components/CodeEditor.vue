<template>
	<div ref="editContainer" class="code-editor" @keydown="onKeyDown"></div>
</template>
<script>
import { getCurrentInstance, onMounted, watch } from 'vue';
import * as monaco from 'monaco-editor'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'

self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'json') {
      return new jsonWorker()
    }
    if (label === 'css' || label === 'scss' || label === 'less') {
      return new cssWorker()
    }
    if (label === 'html' || label === 'handlebars' || label === 'razor') {
      return new htmlWorker()
    }
    if (label === 'typescript' || label === 'javascript') {
      return new tsWorker()
    }
    return new editorWorker()
  }
}

export default {
	props: {
		value: String,
		defaultOptions: {
			type: Object,
			default: () => ({
				fixedOverflowWidgets: true,
			})
		},
		options: {
			type: Object,
			default: () => ({})
		}
	},
	setup(props, { emit }) {
		let monacoEditor = null;
		const { proxy } = getCurrentInstance();

		watch(
			() => props.value,
			(value) => {
					// 防止改变编辑器内容时光标重定向
					if (value !== monacoEditor?.getValue()) {
							monacoEditor.setValue(value);
					}
			},
		);
		watch(
			() => props.options,
			(opt) => {
				monacoEditor?.updateOptions({
					...props.defaultOptions,
					...opt
				})
				// 跟新language
				if (opt.language) monaco.editor.setModelLanguage(monacoEditor?.getModel(), opt.language)
				
			},
			{ deep: true }
		)

		onMounted(() => {
			monacoEditor = monaco.editor.create(proxy.$refs.editContainer, {
				value: props.value,
				...props.defaultOptions,
				...props.options
			});
			// 监听值变化
			monacoEditor.onDidChangeModelContent(() => {
				const currentValue = monacoEditor?.getValue();
				emit('update:value', currentValue);
			});
		});

		const onKeyDown = (e) => {
			if (e.keyCode === 83 && (navigator.platform.match('Mac') ? e.metaKey : e.ctrlKey)) {
				// save
				e.preventDefault()
				const currentValue = monacoEditor?.getValue();
				emit('save', currentValue)
			}
		}

		// 获取 monacoEditor 实例
		const getEditorInstance = () => monacoEditor

		return {
			getEditorInstance,
			onKeyDown
		};
	},
};
</script>

<style lang="less" scoped>
.code-editor {
	width: 100%;
	min-height: 200px;
}
</style>