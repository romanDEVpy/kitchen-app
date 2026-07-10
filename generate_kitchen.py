import bpy
import os

def clean_scene():
    # Delete all mesh, light, camera objects to start clean
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)

def create_box(name, size, location):
    # size is a tuple of (width_x, depth_y, height_z)
    bpy.ops.mesh.primitive_cube_add(size=1.0, calc_uvs=True)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = size
    obj.location = location
    bpy.ops.object.transform_apply(scale=True, location=False, rotation=False)
    return obj

def set_origin(obj, pivot_location):
    # Set active object
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    # Move cursor to pivot_location
    bpy.context.scene.cursor.location = pivot_location
    # Set origin to cursor
    bpy.ops.object.origin_set(type='ORIGIN_CURSOR')
    obj.select_set(False)

def create_materials():
    materials = {}
    for mat_name in ['facade_material', 'countertop_material', 'carcass_material', 'backsplash_material', 'handle_material']:
        mat = bpy.data.materials.get(mat_name)
        if mat is None:
            mat = bpy.data.materials.new(name=mat_name)
            mat.use_nodes = True
            nodes = mat.node_tree.nodes
            principled = nodes.get("Principled BSDF")
            if principled:
                if mat_name == 'facade_material':
                    principled.inputs['Base Color'].default_value = (0.8, 0.8, 0.8, 1.0) # Light grey default
                    principled.inputs['Roughness'].default_value = 0.15 # Glossy (Alvic/AGT style)
                elif mat_name == 'countertop_material':
                    principled.inputs['Base Color'].default_value = (0.2, 0.2, 0.2, 1.0) # Dark stone default
                    principled.inputs['Roughness'].default_value = 0.4
                elif mat_name == 'carcass_material':
                    principled.inputs['Base Color'].default_value = (0.9, 0.9, 0.9, 1.0) # White melamine
                    principled.inputs['Roughness'].default_value = 0.5
                elif mat_name == 'backsplash_material':
                    principled.inputs['Base Color'].default_value = (0.7, 0.7, 0.7, 1.0) # Marble/tile default
                    principled.inputs['Roughness'].default_value = 0.3
                elif mat_name == 'handle_material':
                    principled.inputs['Base Color'].default_value = (0.05, 0.05, 0.05, 1.0) # Matte black
                    principled.inputs['Metallic'].default_value = 1.0
                    principled.inputs['Roughness'].default_value = 0.2
        materials[mat_name] = mat
    return materials

def assign_material(obj, mat):
    if obj.data.materials:
        obj.data.materials[0] = mat
    else:
        obj.data.materials.append(mat)

def build_kitchen(export_path):
    clean_scene()
    mats = create_materials()

    # Dimensions
    cabinet_w = 0.8
    cabinet_h = 0.72
    cabinet_d = 0.58
    plinth_h = 0.10
    countertop_h = 0.04
    total_w = cabinet_w * 3 # 2.4 meters

    # --- Lower Carcass ---
    # Create plinth (toe kick)
    plinth = create_box("Plinth", (total_w, cabinet_d - 0.05, plinth_h), (0, -0.025, plinth_h / 2))
    assign_material(plinth, mats['carcass_material'])

    # Create 3 lower carcasses
    for i in range(3):
        x_pos = -cabinet_w + (i * cabinet_w)
        carcass = create_box(f"Carcass_Lower_{i+1}", (cabinet_w - 0.002, cabinet_d, cabinet_h), (x_pos, -cabinet_d / 2, plinth_h + cabinet_h / 2))
        assign_material(carcass, mats['carcass_material'])

    # --- Countertop ---
    countertop = create_box("Countertop", (total_w + 0.02, cabinet_d + 0.02, countertop_h), (0, -(cabinet_d + 0.02)/2 + 0.01, plinth_h + cabinet_h + countertop_h / 2))
    assign_material(countertop, mats['countertop_material'])

    # --- Backsplash ---
    backsplash_h = 0.60
    backsplash = create_box("Backsplash", (total_w, 0.02, backsplash_h), (0, 0.01, plinth_h + cabinet_h + countertop_h + backsplash_h / 2))
    assign_material(backsplash, mats['backsplash_material'])

    # --- Upper Carcass ---
    upper_h = 0.70
    upper_d = 0.35
    upper_z = plinth_h + cabinet_h + countertop_h + backsplash_h + upper_h / 2
    for i in range(3):
        x_pos = -cabinet_w + (i * cabinet_w)
        upper_carcass = create_box(f"Carcass_Upper_{i+1}", (cabinet_w - 0.002, upper_d, upper_h), (x_pos, -upper_d / 2, upper_z))
        assign_material(upper_carcass, mats['carcass_material'])

    # --- Cabinet Fronts (Doors & Drawers) ---
    front_thickness = 0.018

    # Cabinet 1 (Left Lower): Double Doors
    # Left Door: Hinge Left
    door_w = cabinet_w / 2 - 0.002
    door_h = cabinet_h - 0.004
    dl_x = -cabinet_w - door_w/2
    dl_y = -cabinet_d - front_thickness/2
    dl_z = plinth_h + cabinet_h/2
    door_l = create_box("Door_Lower_L1", (door_w, front_thickness, door_h), (dl_x, dl_y, dl_z))
    assign_material(door_l, mats['facade_material'])
    # Set hinge origin: Left vertical edge
    set_origin(door_l, (dl_x - door_w/2, dl_y + front_thickness/2, dl_z))

    # Right Door: Hinge Right
    dr_x = -cabinet_w + door_w/2
    door_r = create_box("Door_Lower_R1", (door_w, front_thickness, door_h), (dr_x, dl_y, dl_z))
    assign_material(door_r, mats['facade_material'])
    # Set hinge origin: Right vertical edge
    set_origin(door_r, (dr_x + door_w/2, dl_y + front_thickness/2, dl_z))

    # Cabinet 2 (Middle Lower): 3 Drawers
    drawer_h = (cabinet_h - 0.008) / 3
    for j in range(3):
        drawer_z = plinth_h + (j * drawer_h) + drawer_h/2 + 0.002
        drawer = create_box(f"Drawer_Lower_{j+1}", (cabinet_w - 0.004, front_thickness, drawer_h - 0.002), (0, dl_y, drawer_z))
        assign_material(drawer, mats['facade_material'])
        # Set origin: Center of drawer front (closed position)
        set_origin(drawer, (0, dl_y, drawer_z))

    # Cabinet 3 (Right Lower): Single Large Door (Hinge Right)
    door3_w = cabinet_w - 0.004
    door3_x = cabinet_w
    door3 = create_box("Door_Lower_R3", (door3_w, front_thickness, door_h), (door3_x, dl_y, dl_z))
    assign_material(door3, mats['facade_material'])
    # Set hinge origin: Right vertical edge
    set_origin(door3, (door3_x + door3_w/2, dl_y + front_thickness/2, dl_z))

    # --- Upper Fronts ---
    upper_front_z = plinth_h + cabinet_h + countertop_h + backsplash_h + upper_h / 2
    for i in range(3):
        x_pos = -cabinet_w + (i * cabinet_w)
        ud_w = cabinet_w - 0.004
        ud_y = -upper_d - front_thickness/2
        ud = create_box(f"Door_Upper_{i+1}", (ud_w, front_thickness, upper_h - 0.004), (x_pos, ud_y, upper_front_z))
        assign_material(ud, mats['facade_material'])
        # Hinge on the left side
        set_origin(ud, (x_pos - ud_w/2, ud_y + front_thickness/2, upper_front_z))

    # --- UV Project All ---
    bpy.ops.object.select_all(action='SELECT')
    # Go to edit mode to unwrap
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.uv.smart_project(angle_limit=66.0, island_margin=0.01)
    bpy.ops.object.mode_set(mode='OBJECT')

    # Add Studio Lighting and Camera
    bpy.ops.object.light_add(type='SUN', radius=1.0, location=(3, -5, 5))
    sun = bpy.context.active_object
    sun.data.energy = 3.0
    
    # Export to GLB
    # Create export directory if it doesn't exist
    os.makedirs(os.path.dirname(export_path), exist_ok=True)
    
    bpy.ops.export_scene.gltf(
        filepath=export_path,
        export_format='GLB',
        use_selection=False,
        export_apply=True
    )
    print(f"Successfully built and exported kitchen to {export_path}")

if __name__ == '__main__':
    # Define output GLB path
    output_path = r"C:\Users\user\.gemini\antigravity\scratch\kitchen-app\public\models\kitchen.glb"
    build_kitchen(output_path)
